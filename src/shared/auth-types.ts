import z from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    permissions: z.array(z.string()),
  }).optional(),
  token: z.string().optional(),
  message: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const UserPermissions = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_CARDS_VIEW: 'dashboard.cards.view',
  
  // Vendas
  SALES_VIEW: 'sales.view',
  SALES_CREATE: 'sales.create',
  SALES_EDIT: 'sales.edit',
  SALES_DELETE: 'sales.delete',
  SALES_CARDS_VIEW: 'sales.cards.view',
  
  // Estoque
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_EDIT: 'inventory.edit',
  INVENTORY_DELETE: 'inventory.delete',
  INVENTORY_MOVEMENT: 'inventory.movement',
  
  // Financeiro
  FINANCIAL_VIEW: 'financial.view',
  FINANCIAL_CREATE: 'financial.create',
  FINANCIAL_EDIT: 'financial.edit',
  FINANCIAL_DELETE: 'financial.delete',
  
  // Clientes e Fornecedores
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_DELETE: 'customers.delete',
  
  // Ordem de Serviço
  SERVICE_VIEW: 'service.view',
  SERVICE_CREATE: 'service.create',
  SERVICE_EDIT: 'service.edit',
  SERVICE_DELETE: 'service.delete',
  
  // Relatórios
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  
  // Configurações
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  
  // Usuários
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  
  // Auditoria
  AUDIT_VIEW: 'audit.view',
  
  // Seções Específicas
  SECTION_BRANDS_CATEGORIES: 'section.brands_categories',
  SECTION_PAYMENT_METHODS: 'section.payment_methods',
  SECTION_WARRANTY_STOCK: 'section.warranty_stock',
} as const;

export type Permission = typeof UserPermissions[keyof typeof UserPermissions];
