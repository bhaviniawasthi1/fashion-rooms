import OpenAI from 'openai';
import db from '../db/index.js';
import { getSharedCartItems } from './sharedCartService.js';
import { getRoomMembers } from './memberService.js';
import { getRoomMessages } from './messageService.js';
import { getProductVotes } from './voteService.js';
import type { Room } from '../types/index.js';

interface AIContext {
  room: Room | null;
  occasion: string;
  members: string[];
  cartProducts: string;
  catalogProducts: string;
  recentChat: string;
  fullChat: string;
  votes: string;
  query: string;
  userName: string;
}

const OCCASION_CATEGORIES: Record<string, string[]> = {
  Wedding: ['Women', 'Men', 'Footwear', 'Accessories'],
  Party: ['Women', 'Men', 'Footwear', 'Accessories', 'Beauty'],
  Trip: ['Men', 'Women', 'Footwear', 'Accessories', 'Beauty'],
  College: ['Men', 'Women', 'Footwear', 'Accessories'],
  Office: ['Men', 'Women', 'Accessories'],
  Festival: ['Women', 'Men', 'Footwear', 'Accessories', 'Beauty'],
  Birthday: ['Women', 'Men', 'Footwear', 'Accessories'],
  Casual: ['Men', 'Women', 'Footwear', 'Accessories', 'Kids', 'GenZ'],
  Date: ['Women', 'Men', 'Footwear', 'Accessories', 'Beauty'],
  Vacation: ['Footwear', 'Women', 'Men', 'Accessories', 'Beauty', 'Kids'],
};

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-key-here') return null;
  if (!openai) {
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export async function getAIAssistantResponse(
  roomId: string,
  query: string,
  userName: string,
  userId: string
): Promise<string> {
  const context = await gatherContext(roomId, query, userName, userId);
  const openaiClient = getOpenAI();

  if (openaiClient) {
    try {
      return await callOpenAI(context, openaiClient);
    } catch {
      return generateMockResponse(context);
    }
  }

  return generateMockResponse(context);
}

function getCatalogProducts(occasion: string): { text: string; list: { id: string; name: string; brand: string; price: number; category: string }[] } {
  const categories = OCCASION_CATEGORIES[occasion] || ['Men', 'Women', 'Footwear'];
  const placeholders = categories.map(() => '?').join(',');
  const products = db.prepare(`
    SELECT id, name, brand, price, category FROM products
    WHERE category IN (${placeholders}) AND in_stock = 1
    ORDER BY rating DESC LIMIT 12
  `).all(...(categories as [string])) as any[];

  return {
    text: products.length > 0
      ? products.map(p => `${p.name} by ${p.brand} (₹${p.price}, ${p.category}) →[View](${p.id})←`).join('\n')
      : 'No products available in the catalog for this occasion.',
    list: products.map(p => ({ id: p.id, name: p.name, brand: p.brand, price: p.price, category: p.category })),
  };
}

async function gatherContext(
  roomId: string,
  query: string,
  userName: string,
  _userId: string
): Promise<AIContext> {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId) as any;
  const members = getRoomMembers(roomId);
  const cartItems = getSharedCartItems(roomId);
  const recentMessages = getRoomMessages(roomId, 50);
  const productVotes = getProductVotes(roomId);

  const memberNames = members.map(m => m.name);
  const cartProductsList = cartItems.length > 0
    ? cartItems.map(i => `${i.product.name} (₹${i.product.price}, Colors: ${i.product.colors.join(', ')}, Sizes: ${i.product.sizes.join(', ')})`).join('\n')
    : 'No products in shared cart yet';

  const textMessages = recentMessages.filter(m => m.type === 'text');
  const fullChat = textMessages
    .map(m => `${m.user?.name || 'System'}: ${m.content}`)
    .join('\n');

  const recentChat = textMessages
    .slice(-20)
    .map(m => `${m.user?.name || 'System'}: ${m.content}`)
    .join('\n');

  const votesSummary = Object.entries(productVotes)
    .map(([prodId, counts]) => {
      const item = cartItems.find(i => i.product_id === prodId);
      const name = item?.product.name || prodId;
      const details = counts.map(c =>
        `  ${c.vote_type}: ${Object.entries(c.values).map(([k, v]) => `${k}(${v})`).join(', ')}`
      ).join('\n');
      return `${name}:\n${details}`;
    })
    .join('\n');

  const occasion = room?.occasion || 'Casual';
  const catalog = getCatalogProducts(occasion);

  return {
    room,
    occasion,
    members: memberNames,
    cartProducts: cartProductsList,
    catalogProducts: catalog.text,
    recentChat,
    fullChat,
    votes: votesSummary || 'No votes yet',
    query,
    userName,
  };
}

async function callOpenAI(context: AIContext, client: OpenAI): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: context.query },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || generateMockResponse(context);
}

function buildSystemPrompt(context: AIContext): string {
  return `You are @Maya, an AI fashion stylist and shopping assistant for Fashion Rooms. You participate in group conversations about fashion decisions. You talk like a real human fashion expert — never mention you're AI.

ROOM CONTEXT:
- Room Occasion: ${context.occasion}
- Members: ${context.members.join(', ')}

PRODUCTS IN SHARED CART:
${context.cartProducts}

FULL PRODUCT CATALOG (available for this occasion):
${context.catalogProducts}

FULL CHAT HISTORY (everything discussed in the room):
${context.fullChat}

RECENT CHAT (last 20 messages — focus most on these):
${context.recentChat}

VOTES:
${context.votes}

- User asking: ${context.userName}

CRITICAL GUIDELINES:
1. DEEPLY ANALYZE the chat history. Understand what each member wants — their preferred styles, colors, categories, brands, budgets mentioned. Use this to give personalized suggestions.
2. The room occasion is just a hint. The ACTUAL conversation context is MORE important. If users are discussing something unrelated to the occasion, respond to THAT.
3. When recommending a product from the catalog, ALWAYS include a clickable link using this format: →[Product Name](productId)←. For example: →[Blue Silk Dress](prod123)←
4. You can recommend products from BOTH the shared cart AND the catalog. Use catalog products for fresh suggestions.
5. Keep responses concise (2-4 sentences) but specific.
6. Use emojis occasionally.
7. If someone asks "suggest a product for me" or "recommend something", search the catalog and link specific products they'd like based on their chat history.
8. NEVER mention you are an AI or that you're generating a response. BE @Maya.`;
}

function generateMockResponse(context: AIContext): string {
  const { occasion, query, cartProducts, catalogProducts, userName, members, recentChat } = context;
  const q = query.toLowerCase();

  const catalogItems = catalogProducts.split('\n').filter(l => l.includes('→[View]'));
  const firstCatalogItem = catalogItems[0] || '';
  const catalogMatch = firstCatalogItem.match(/^(.*?)\s*→\[View\]\(([^)]+)\)←/);
  const catalogName = catalogMatch ? catalogMatch[1] : '';
  const catalogId = catalogMatch ? catalogMatch[2] : '';

  const hasCart = cartProducts && !cartProducts.includes('No products');
  const cartLines = hasCart ? cartProducts.split('\n') : [];
  const firstCartItem = cartLines[0] || '';
  const cartMatch = firstCartItem.match(/^(.*?)\s*\(₹/);
  const cartName = cartMatch ? cartMatch[1] : '';

  const getProductLink = (name: string, id: string) => `→[${name}](${id})←`;

  if (q.includes('suggest') || q.includes('recommend') || q.includes('what should i') || q.includes('need a')) {
    if (catalogId) {
      return `Based on what everyone's been discussing, I think you'd love ${getProductLink(catalogName, catalogId)}! It's perfect for the ${occasion.toLowerCase()} vibe the group is going for. What do you all think? 🛍️✨`;
    }
    if (hasCart) {
      return `I'm loving the ${cartName || 'products'} in your cart! For your ${occasion.toLowerCase()} plans, that's a solid pick. Want me to suggest complementary accessories? 💫`;
    }
    return `For your ${occasion.toLowerCase()} plans, I'd suggest starting with a versatile base piece. Here's a great option: ${getProductLink('Casual Cotton Shirt', 'prod-men-1')}! Add accessories to match the vibe. Once you add products to the shared cart, I can give more specific advice. 💫`;
  }

  if (q.includes('color') || q.includes('match') || q.includes('go with') || q.includes('what goes')) {
    if (hasCart) {
      return `Looking at your cart picks, I'd suggest pairing with neutral accessories and letting the main piece shine. A pop of color in accessories always elevates the look! What colors are you leaning toward? 🎨✨`;
    }
    return `For ${occasion.toLowerCase()}, jewel tones like emerald and sapphire or soft pastels would be gorgeous! ${catalogId ? `${getProductLink(catalogName, catalogId)} comes in great color options!` : ''} 🎨`;
  }

  if (q.includes('summar') || q.includes('recap') || q.includes('what happened') || q.includes('catch me up')) {
    const membersList = members.length > 0 ? members.join(', ') : 'No members yet';
    const prodSummary = hasCart
      ? `${cartLines.length} product(s) in the shared cart`
      : 'No products in the shared cart yet';
    return `Here's what's happened in this ${occasion.toLowerCase()} room so far:\n\n👥 Members: ${membersList}\n🛍️ ${prodSummary}\n🗳️ ${context.votes && !context.votes.includes('No votes') ? 'Voting is active' : 'No votes yet'}\n\nFrom the chat, I can see you've been discussing ${occasion.toLowerCase()} fashion. Want me to suggest something specific? 😊`;
  }

  if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
    return `Hey ${userName}! 👋 I'm @Maya! I've been following your chat — looks like you're planning something exciting for ${occasion.toLowerCase()}! Need help with outfit ideas, color combos, or product suggestions? Just ask! 💅✨`;
  }

  if (q.includes('vote') || q.includes('decision') || q.includes('choose')) {
    return `I've been watching the discussion! If you're torn between options, think about versatility — which piece would you wear beyond just this ${occasion.toLowerCase()}? That's usually the best value. Also, trust your first instinct! 💡`;
  }

  if (q.includes('budget') || q.includes('price') || q.includes('cost') || q.includes('afford')) {
    return `Great question about budget! For ${occasion.toLowerCase()}, you can find amazing options at every price point. ${catalogId ? `${getProductLink(catalogName, catalogId)} is a great mid-range option!` : ''} Quality basics are always worth investing in! 💰`;
  }

  if (q.includes('outfit') || q.includes('complete') || q.includes('wear with')) {
    if (hasCart) {
      return `To complete your ${occasion.toLowerCase()} look with ${cartName || 'your picks'}, think about: comfortable footwear, minimal accessories that don't overpower, and layers if the weather calls for it! ${catalogId ? `I'd also suggest checking out ${getProductLink(catalogName, catalogId)} to complete the vibe!` : ''} 💃`;
    }
    return `A complete ${occasion.toLowerCase()} outfit needs: a statement main piece, comfy footwear, accessories that tie it together. ${catalogId ? `${getProductLink(catalogName, catalogId)} would be a great starting point!` : ''} Start with one hero item! 🌟`;
  }

  return `Hey ${userName}! Based on your chat, I can see you're into ${occasion.toLowerCase()} fashion. ${catalogId ? `Check out ${getProductLink(catalogName, catalogId)} — I think it'd be right up your alley!` : ''} Want me to suggest something specific from the catalog? 😊🛍️`;
}

export { getCatalogProducts };
