import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import type { SharedCartItem } from '../types/index.js';

export function addToSharedCart(roomId: string, productId: string, userId: string): { item: SharedCartItem; alreadyExists: boolean } | null {
  const product = db.prepare('SELECT id, name, brand, price, original_price, images, colors, sizes FROM products WHERE id = ?').get(productId) as any;
  if (!product) return null;

  const existing = db.prepare('SELECT id, quantity FROM shared_cart_items WHERE room_id = ? AND product_id = ?').get(roomId, productId) as any;
  if (existing) {
    db.prepare('UPDATE shared_cart_items SET quantity = quantity + 1 WHERE id = ?').run(existing.id);
    return { item: getSharedCartItemById(existing.id)!, alreadyExists: true };
  }

  const id = uuidv4();
  const addedAt = new Date().toISOString();
  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as any;

  db.prepare(`
    INSERT INTO shared_cart_items (id, room_id, product_id, added_by, quantity, added_at)
    VALUES (?, ?, ?, ?, 1, ?)
  `).run(id, roomId, productId, userId, addedAt);

  const images = JSON.parse(product.images);
  const colors = JSON.parse(product.colors);
  const sizes = JSON.parse(product.sizes);

  const item: SharedCartItem = {
    id,
    room_id: roomId,
    product_id: productId,
    added_by: userId,
    quantity: 1,
    added_at: addedAt,
    added_by_name: user.name,
    product: {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      original_price: product.original_price,
      image: images[0] || '',
      colors,
      sizes,
    },
  };
  return { item, alreadyExists: false };
}

function getSharedCartItemById(itemId: string): SharedCartItem | null {
  const row = db.prepare(`
    SELECT sci.*, u.name as added_by_name, p.name, p.brand, p.price, p.original_price, p.images, p.colors, p.sizes
    FROM shared_cart_items sci
    JOIN users u ON sci.added_by = u.id
    JOIN products p ON sci.product_id = p.id
    WHERE sci.id = ?
  `).get(itemId) as any;
  if (!row) return null;
  return {
    id: row.id,
    room_id: row.room_id,
    product_id: row.product_id,
    added_by: row.added_by,
    quantity: row.quantity,
    added_at: row.added_at,
    added_by_name: row.added_by_name,
    product: {
      id: row.product_id,
      name: row.name,
      brand: row.brand,
      price: row.price,
      original_price: row.original_price,
      image: JSON.parse(row.images)[0] || '',
      colors: JSON.parse(row.colors),
      sizes: JSON.parse(row.sizes),
    },
  };
}

export function removeFromSharedCart(itemId: string, roomId: string): boolean {
  const result = db.prepare('DELETE FROM shared_cart_items WHERE id = ? AND room_id = ?').run(itemId, roomId);
  return result.changes > 0;
}

export function getSharedCartItems(roomId: string): SharedCartItem[] {
  const rows = db.prepare(`
    SELECT sci.*, u.name as added_by_name, p.name, p.brand, p.price, p.original_price, p.images, p.colors, p.sizes
    FROM shared_cart_items sci
    JOIN users u ON sci.added_by = u.id
    JOIN products p ON sci.product_id = p.id
    WHERE sci.room_id = ?
    ORDER BY sci.added_at DESC
  `).all(roomId) as any[];

  return rows.map(row => ({
    id: row.id,
    room_id: row.room_id,
    product_id: row.product_id,
    added_by: row.added_by,
    quantity: row.quantity || 1,
    added_at: row.added_at,
    added_by_name: row.added_by_name,
    product: {
      id: row.product_id,
      name: row.name,
      brand: row.brand,
      price: row.price,
      original_price: row.original_price,
      image: JSON.parse(row.images)[0] || '',
      colors: JSON.parse(row.colors),
      sizes: JSON.parse(row.sizes),
    },
  }));
}

export function isProductInSharedCart(roomId: string, productId: string): boolean {
  const row = db.prepare('SELECT id FROM shared_cart_items WHERE room_id = ? AND product_id = ?').get(roomId, productId);
  return !!row;
}
