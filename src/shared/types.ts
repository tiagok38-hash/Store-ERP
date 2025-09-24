import z from "zod";

// Produtos
export const ProductSchema = z.object({
  id: z.number(),
  sku: z.string(),
  description: z.string(),
  brand: z.string().optional(),
  model: z.string().optional(),
  variation: z.string().optional(),
  cost_price: z.number().optional(),
  sale_price: z.number().optional(),
  markup: z.number().optional(),
  ncm: z.string().optional(),
  unit: z.string().default('UN'),
  requires_imei: z.boolean().default(false),
  requires_serial: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;

// Unidades de estoque
export const InventoryUnitSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  imei: z.string().optional(),
  serial_number: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['available', 'sold', 'in_service', 'defective']).default('available'),
  purchase_id: z.number().optional(),
  sale_id: z.number().optional(),
  service_order_id: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type InventoryUnit = z.infer<typeof InventoryUnitSchema>;

// Clientes
export const CustomerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  observations: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Customer = z.infer<typeof CustomerSchema>;

// Usuários
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'seller', 'technician', 'financial', 'stock', 'auditor']),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Vendas
export const SaleSchema = z.object({
  id: z.number(),
  customer_id: z.number().optional(),
  cash_register_id: z.number(),
  user_id: z.number(),
  subtotal: z.number(),
  discount: z.number().default(0),
  total_amount: z.number(),
  payment_methods: z.string(), // JSON
  receipt_number: z.string().optional(),
  status: z.enum(['completed', 'cancelled']).default('completed'),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Sale = z.infer<typeof SaleSchema>;

// Ordens de Serviço
export const ServiceOrderSchema = z.object({
  id: z.number(),
  customer_id: z.number(),
  technician_id: z.number().optional(),
  device_brand: z.string().optional(),
  device_model: z.string().optional(),
  device_imei: z.string().optional(),
  device_serial: z.string().optional(),
  reported_issue: z.string().optional(),
  diagnosis: z.string().optional(),
  budget_amount: z.number().optional(),
  final_amount: z.number().optional(),
  pix_key: z.string().optional(),
  pix_qr_code: z.string().optional(),
  warranty_days: z.number().default(0),
  status: z.enum(['received', 'diagnosed', 'budgeted', 'approved', 'in_progress', 'completed', 'delivered']).default('received'),
  attachments: z.string().optional(), // JSON
  created_at: z.string(),
  updated_at: z.string(),
});

export type ServiceOrder = z.infer<typeof ServiceOrderSchema>;

// Dashboard Stats
export const DashboardStatsSchema = z.object({
  todaySales: z.number(),
  todayRevenue: z.number(),
  openServiceOrders: z.number(),
  lowStockItems: z.number(),
  pendingPayments: z.number(),
  overdueTitles: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
