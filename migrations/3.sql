
-- Melhoria na tabela de usuários para incluir permissões
ALTER TABLE users ADD COLUMN permissions TEXT; -- JSON com permissões específicas
ALTER TABLE users ADD COLUMN last_login DATETIME;
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Tabela para métodos de pagamento
CREATE TABLE payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'cash', 'card', 'pix', 'bank_transfer', 'credit'
  is_active BOOLEAN DEFAULT 1,
  requires_approval BOOLEAN DEFAULT 0,
  fee_percentage REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para configurações do sistema
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais
INSERT INTO categories (name, description) VALUES 
('Smartphones', 'Celulares e smartphones'),
('Acessórios', 'Acessórios para celulares'),
('Tablets', 'Tablets e iPads'),
('Smartwatches', 'Relógios inteligentes');

INSERT INTO brands (name, description) VALUES 
('Apple', 'Produtos Apple'),
('Samsung', 'Produtos Samsung'),
('Xiaomi', 'Produtos Xiaomi'),
('JBL', 'Produtos JBL'),
('Anker', 'Produtos Anker');

INSERT INTO payment_methods (name, type, is_active) VALUES 
('Dinheiro', 'cash', 1),
('PIX', 'pix', 1),
('Cartão de Débito', 'card', 1),
('Cartão de Crédito', 'card', 1),
('Transferência Bancária', 'bank_transfer', 1),
('Crediário', 'credit', 1);

INSERT INTO system_settings (key, value, description) VALUES 
('company_name', 'StoreFlow Pro', 'Nome da empresa'),
('company_cnpj', '', 'CNPJ da empresa'),
('receipt_footer', 'Obrigado pela preferência!', 'Mensagem no rodapé do recibo'),
('default_warranty_months', '12', 'Garantia padrão em meses');
