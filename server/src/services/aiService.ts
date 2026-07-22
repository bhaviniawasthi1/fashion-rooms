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
  products: string;
  recentChat: string;
  votes: string;
  query: string;
  userName: string;
}

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

async function gatherContext(
  roomId: string,
  query: string,
  userName: string,
  _userId: string
): Promise<AIContext> {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId) as any;
  const members = getRoomMembers(roomId);
  const cartItems = getSharedCartItems(roomId);
  const recentMessages = getRoomMessages(roomId, 20);
  const productVotes = getProductVotes(roomId);

  const memberNames = members.map(m => m.name);
  const productsList = cartItems.length > 0
    ? cartItems.map(i => `${i.product.name} (₹${i.product.price}, Colors: ${i.product.colors.join(', ')}, Sizes: ${i.product.sizes.join(', ')})`).join('\n')
    : 'No products in shared cart yet';

  const chatHistory = recentMessages
    .filter(m => m.type === 'text')
    .slice(-10)
    .map(m => `${m.user?.name || 'System'}: ${m.content}`)
    .join('\n');

  const votesSummary = Object.entries(productVotes)
    .map(([prodId, counts]) => {
      const item = cartItems.find(i => i.product_id === prodId);
      const name = item?.product.name || prodId;
      const details = counts.map(c => `  ${c.vote_type}: ${Object.entries(c.values).map(([k, v]) => `${k}(${v})`).join(', ')}`).join('\n');
      return `${name}:\n${details}`;
    })
    .join('\n');

  const occasion = room?.occasion || 'Casual';

  return {
    room,
    occasion,
    members: memberNames,
    products: productsList,
    recentChat: chatHistory,
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
    max_tokens: 300,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || generateMockResponse(context);
}

function buildSystemPrompt(context: AIContext): string {
  return `You are @Maya, an AI fashion stylist and shopping assistant for Fashion Rooms. You participate in group conversations about fashion decisions.

Current Context:
- Room Occasion: ${context.occasion}
- Members: ${context.members.join(', ')}
- Products in Shared Cart:
${context.products}

- Recent Conversation:
${context.recentChat}

- Current Votes:
${context.votes}

- User asking: ${context.userName}

Guidelines:
1. Be helpful, friendly, and fashion-savvy. Use a warm, conversational tone.
2. Give specific, actionable fashion advice based on the products and occasion.
3. If asked for suggestions, recommend based on what's in the cart or mention what would go well.
4. Consider the occasion and help the group make better fashion decisions.
5. Keep responses to 2-3 short sentences maximum.
6. Use emojis occasionally to keep it lively.
7. If asked about colors or styles, give specific recommendations.
8. NEVER mention that you are an AI or that you're generating a response. Just BE @Maya.`;
}

function generateMockResponse(context: AIContext): string {
  const { occasion, query, products, userName, votes } = context;
  const q = query.toLowerCase();

  if (q.includes('suggest') || q.includes('recommend') || q.includes('what')) {
    if (products && !products.includes('No products')) {
      const productLines = products.split('\n');
      const firstProduct = productLines[0];
      const match = firstProduct.match(/^(.*?)\s*\(₹/);
      const productName = match ? match[1] : firstProduct;

      if (q.includes('shoe') || q.includes('footwear') || q.includes('accessor')) {
        return `For a ${occasion.toLowerCase()} look with ${productName}, I'd suggest pairing it with minimal white sneakers or tan loafers. A crossbody bag would complete the vibe perfectly! 👟✨`;
      }
      if (q.includes('color')) {
        if (firstProduct.includes('Colors:')) {
          const colorMatch = firstProduct.match(/Colors: ([^)]+)/);
          const colors = colorMatch ? colorMatch[1] : 'available';
          return `Looking at the colors available (${colors}), I think ${colors.split(',')[0] || 'the first option'} would be stunning for a ${occasion.toLowerCase()}! It's versatile and pairs well with neutrals. 🎨`;
        }
        return `For a ${occasion.toLowerCase()} outfit, I'd recommend going with earthy tones or pastels - they photograph beautifully and always look premium! 🌸`;
      }
      if (q.includes('occasion') || q.includes('wear') || q.includes('dress')) {
        return `For ${occasion.toLowerCase()}, ${productName} is a great choice! Consider layering with a light jacket or blazer, and accessorize with statement jewelry to elevate the look. You've got great taste! 💫`;
      }
      return `I love ${productName} for ${occasion.toLowerCase()}! If you want alternatives, look for pieces in complementary colors. The group seems to have great taste! 🛍️`;
    }
    return `For a ${occasion.toLowerCase()} look, I'd suggest starting with a versatile base piece — maybe a solid-colored dress or a well-fitted blazer. Add accessories to match the vibe! Once you add some products to the shared cart, I can give more specific recommendations. 💫`;
  }

  if (q.includes('color') || q.includes('match') || q.includes('go with')) {
    if (products && !products.includes('No products')) {
      return `Based on what's in your cart, I'd suggest pairing with neutral accessories and maybe a pop of color in your footwear or bag. The key is balance — let one piece be the statement! ✨`;
    }
    return `For ${occasion.toLowerCase()}, jewel tones like emerald and sapphire, or soft pastels like blush and lavender would be gorgeous. What's your personal style? 💎`;
  }

  if (q.includes('summar') || q.includes('recap') || q.includes('what happened') || q.includes('catch me up')) {
    const membersList = context.members.length > 0 ? context.members.join(', ') : 'No members yet';
    const prodSummary = products && !products.includes('No products')
      ? `${products.split('\n').length} product(s) in the shared cart`
      : 'No products in the shared cart yet';
    return `Here's what's happened so far in this ${occasion.toLowerCase()} room:\n\n👥 Members: ${membersList}\n🛍️ ${prodSummary}\n🗳️ ${votes && !votes.includes('No votes') ? 'Voting is active on some products' : 'No votes cast yet'}\n\nThe group has been discussing ${occasion.toLowerCase()} fashion. Want me to suggest something specific? 😊`;
  }

  if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
    return `Hey ${userName}! 👋 I'm @Maya, your fashion assistant. I can help with outfit suggestions, color coordination, and style advice for your ${occasion.toLowerCase()} plans. What does everyone think of the products so far?`;
  }

  if (q.includes('vote') || q.includes('decision') || q.includes('choose')) {
    if (votes && !votes.includes('No votes')) {
      return `I've been watching the votes! The group seems to have strong preferences. If you're torn, think about versatility — which piece would you wear more often beyond just this ${occasion.toLowerCase()}? That's usually the best value pick! 💡`;
    }
    return `Voting is a great way to make group decisions! Consider what fits the ${occasion.toLowerCase()} vibe best and what everyone would feel confident in. I'm here to help if you need styling advice! 🗳️`;
  }

  if (q.includes('budget') || q.includes('price') || q.includes('cost') || q.includes('₹')) {
    return `Great question! For ${occasion.toLowerCase()}, you can find amazing options across budgets. The key is investing in versatile pieces that you can style multiple ways. Quality basics are always worth it! 💰`;
  }

  if (q.includes('outfit') || q.includes('complete')) {
    if (products && !products.includes('No products')) {
      return `To complete the look for ${occasion.toLowerCase()}, think about: 1) Footwear — comfortable yet stylish, 2) Accessories — minimal or statement depending on the outfit, 3) Hair and makeup that complements the vibe. You're going to look amazing! 💃`;
    }
    return `A complete ${occasion.toLowerCase()} outfit could include: a standout main piece, comfortable footwear (you'll thank yourself later!), and accessories that tie it all together. Start with one hero item and build around it! 🌟`;
  }

  return `That's a great question, ${userName}! For your ${occasion.toLowerCase()} plans, I'd recommend considering pieces that are both stylish and practical. Would you like me to suggest specific colors or styles? 😊`;
}
