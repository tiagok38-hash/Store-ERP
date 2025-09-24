
-- Produtos
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL,
  description TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  variation TEXT, -- cor, capacidade
  cost_price REAL,
  sale_price REAL,
  markup REAL,
  ncm TEXT,
  unit TEXT DEFAULT 'UN',
  requires_imei BOOLEAN DEFAULT 0,
  requires_serial BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Estoque unitário (IMEI/Serial)
CREATE TABLE inventory_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  imei TEXT,
  serial_number TEXT,
  location TEXT,
  status TEXT DEFAULT 'available', -- available, sold, in_service, defective
  purchase_id INTEGER,
  sale_id INTEGER,
  service_order_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clientes
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT, -- CPF/CNPJ
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  observations TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fornecedores
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT, -- CNPJ
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  observations TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Usuários/Colaboradores
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL, -- admin, manager, seller, technician, financial, stock, auditor
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Caixas
CREATE TABLE cash_registers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  opening_amount REAL DEFAULT 0,
  closing_amount REAL,
  total_sales REAL DEFAULT 0,
  total_supply REAL DEFAULT 0,
  total_withdrawal REAL DEFAULT 0,
  opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  status TEXT DEFAULT 'open', -- open, closed
  observations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vendas
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  cash_register_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  discount REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  payment_methods TEXT, -- JSON com métodos de pagamento
  receipt_number TEXT,
  status TEXT DEFAULT 'completed', -- completed, cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Itens de venda
CREATE TABLE sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  inventory_unit_id INTEGER,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ordens de Serviço
CREATE TABLE service_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  technician_id INTEGER,
  device_brand TEXT,
  device_model TEXT,
  device_imei TEXT,
  device_serial TEXT,
  reported_issue TEXT,
  diagnosis TEXT,
  budget_amount REAL,
  final_amount REAL,
  pix_key TEXT,
  pix_qr_code TEXT,
  warranty_days INTEGER DEFAULT 0,
  status TEXT DEFAULT 'received', -- received, diagnosed, budgeted, approved, in_progress, completed, delivered
  attachments TEXT, -- JSON com URLs de fotos/documentos
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Títulos financeiros (contas a pagar/receber)
CREATE TABLE financial_titles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- receivable, payable
  origin TEXT, -- sale, service_order, purchase, credit
  origin_id INTEGER,
  customer_id INTEGER,
  supplier_id INTEGER,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date DATE NOT NULL,
  paid_amount REAL DEFAULT 0,
  paid_at DATETIME,
  installment_number INTEGER DEFAULT 1,
  total_installments INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending', -- pending, paid, overdue
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Máquinas de cartão
CREATE TABLE card_machines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  provider TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Taxas de cartão
CREATE TABLE card_fees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_machine_id INTEGER NOT NULL,
  card_brand TEXT NOT NULL, -- visa, mastercard, elo, etc
  installments INTEGER NOT NULL,
  fee_percentage REAL NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_inventory_units_product_id ON inventory_units(product_id);
CREATE INDEX idx_inventory_units_imei ON inventory_units(imei);
CREATE INDEX idx_inventory_units_serial ON inventory_units(serial_number);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_financial_titles_due_date ON financial_titles(due_date);
CREATE INDEX idx_financial_titles_origin ON financial_titles(origin, origin_id);
