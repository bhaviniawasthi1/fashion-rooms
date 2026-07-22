import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { dummyProducts } from '../data/products.js';

const router = Router();

export function seedProducts(): void {
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO products (id, name, brand, price, original_price, description, category, images, colors, sizes, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((products: typeof dummyProducts) => {
      for (const product of products) {
        insert.run(
          uuidv4(),
          product.name,
          product.brand,
          product.price,
          product.original_price,
          product.description,
          product.category,
          JSON.stringify(product.images),
          JSON.stringify(product.colors),
          JSON.stringify(product.sizes),
          product.rating
        );
      }
    });

    insertMany(dummyProducts);
    console.log(`Seeded ${dummyProducts.length} products`);
  }
}

router.get('/', (_req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice, sort } = _req.query;

  let query = 'SELECT * FROM products WHERE in_stock = 1';
  const params: any[] = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR brand LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (minPrice) {
    query += ' AND price >= ?';
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(Number(maxPrice));
  }

  if (sort === 'price_asc') {
    query += ' ORDER BY price ASC';
  } else if (sort === 'price_desc') {
    query += ' ORDER BY price DESC';
  } else if (sort === 'rating') {
    query += ' ORDER BY rating DESC';
  } else {
    query += ' ORDER BY created_at DESC';
  }

  const products = db.prepare(query).all(...params) as any[];

  const parsed = products.map(p => ({
    ...p,
    images: JSON.parse(p.images),
    colors: JSON.parse(p.colors),
    sizes: JSON.parse(p.sizes),
  }));

  res.json({ products: parsed });
});

// Cart routes (must come before /:id)
router.post('/cart/add', authenticateToken, (req: AuthRequest, res: Response) => {
  const { productId, quantity = 1 } = req.body;

  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const existing = db.prepare('SELECT id, quantity FROM carts WHERE user_id = ? AND product_id = ?').get(req.userId, productId) as any;

  if (existing) {
    db.prepare('UPDATE carts SET quantity = ? WHERE id = ?').run(existing.quantity + quantity, existing.id);
    res.json({ message: 'Item already in cart', alreadyExists: true });
    return;
  }

  db.prepare('INSERT INTO carts (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)').run(uuidv4(), req.userId, productId, quantity);
  res.json({ message: 'Added to cart' });
});

router.get('/cart', authenticateToken, (req: AuthRequest, res: Response) => {
  const items = db.prepare(`
    SELECT c.id as cart_id, c.quantity, c.added_at, p.*
    FROM carts c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.added_at DESC
  `).all(req.userId) as any[];

  const parsed = items.map(item => ({
    cartId: item.cart_id,
    quantity: item.quantity,
    addedAt: item.added_at,
    product: {
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      original_price: item.original_price,
      description: item.description,
      category: item.category,
      images: JSON.parse(item.images),
      colors: JSON.parse(item.colors),
      sizes: JSON.parse(item.sizes),
      rating: item.rating,
    }
  }));

  res.json({ items: parsed });
});

router.post('/cart/checkout', authenticateToken, (req: AuthRequest, res: Response) => {
  const { cartIds } = req.body;
  if (!Array.isArray(cartIds) || cartIds.length === 0) {
    res.status(400).json({ error: 'cartIds array required' });
    return;
  }

  const items = db.prepare(`
    SELECT c.id, c.product_id, c.quantity
    FROM carts c
    WHERE c.user_id = ? AND c.id IN (${cartIds.map(() => '?').join(',')})
  `).all(req.userId, ...cartIds) as any[];

  if (items.length === 0) {
    res.status(400).json({ error: 'No valid cart items found' });
    return;
  }

  const insert = db.prepare('INSERT INTO personal_checkouts (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)');
  const deleteItem = db.prepare('DELETE FROM carts WHERE id = ? AND user_id = ?');

  const transaction = db.transaction(() => {
    for (const item of items) {
      insert.run(uuidv4(), req.userId, item.product_id, item.quantity);
      deleteItem.run(item.id, req.userId);
    }
  });

  transaction();
  res.json({ message: 'Checkout successful', count: items.length });
});

router.put('/cart/:cartId', authenticateToken, (req: AuthRequest, res: Response) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    res.status(400).json({ error: 'Quantity must be at least 1' });
    return;
  }
  db.prepare('UPDATE carts SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, req.params.cartId, req.userId);
  res.json({ message: 'Quantity updated' });
});

router.delete('/cart/:cartId', authenticateToken, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM carts WHERE id = ? AND user_id = ?').run(req.params.cartId, req.userId);
  res.json({ message: 'Removed from cart' });
});

// Wishlist routes (must come before /:id)
router.post('/wishlist/add', authenticateToken, (req: AuthRequest, res: Response) => {
  const { productId } = req.body;

  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const existing = db.prepare('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?').get(req.userId, productId) as any;
  if (existing) {
    res.json({ message: 'Already in wishlist', wishId: existing.id });
    return;
  }

  const wishId = uuidv4();
  db.prepare('INSERT INTO wishlists (id, user_id, product_id) VALUES (?, ?, ?)').run(wishId, req.userId, productId);
  res.json({ message: 'Added to wishlist', wishId });
});

router.get('/wishlist', authenticateToken, (req: AuthRequest, res: Response) => {
  const items = db.prepare(`
    SELECT w.id as wish_id, w.added_at, p.*
    FROM wishlists w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.added_at DESC
  `).all(req.userId) as any[];

  const parsed = items.map(item => ({
    wishId: item.wish_id,
    addedAt: item.added_at,
    product: {
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      original_price: item.original_price,
      description: item.description,
      category: item.category,
      images: JSON.parse(item.images),
      colors: JSON.parse(item.colors),
      sizes: JSON.parse(item.sizes),
      rating: item.rating,
    }
  }));

  res.json({ items: parsed });
});

router.delete('/wishlist/:wishId', authenticateToken, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM wishlists WHERE id = ? AND user_id = ?').run(req.params.wishId, req.userId);
  res.json({ message: 'Removed from wishlist' });
});

// Product by ID (must come last to avoid shadowing /cart, /wishlist)
router.get('/:id', (req: Request, res: Response) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({
    product: {
      ...product,
      images: JSON.parse(product.images),
      colors: JSON.parse(product.colors),
      sizes: JSON.parse(product.sizes),
    }
  });
});

export default router;
