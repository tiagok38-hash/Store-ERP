import { Hono } from 'hono';
import type { Database } from '@/worker/types';

export const productsWithStockApi = new Hono<{ Bindings: Database }>();

productsWithStockApi.get('/', async (c) => {
  try {
    const db = c.env.DB;
    
    const products = await db.prepare(`
      SELECT 
        p.*,
        COUNT(CASE WHEN iu.status = 'available' THEN 1 END) as available_stock,
        p.min_stock -- Adicionado min_stock
      FROM products p
      LEFT JOIN inventory_units iu ON p.id = iu.product_id
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY p.description
    `).all();

    return c.json(products.results || []);
  } catch (error) {
    console.error('Error fetching products with stock:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});