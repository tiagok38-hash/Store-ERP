
-- Inserir dados de marcas pré-cadastradas organizadas hierarquicamente
INSERT INTO brands (name, description) VALUES 
('Apple', 'Produtos Apple - iPhone, iPad, Mac, Apple Watch, AirPods'),
('Samsung', 'Produtos Samsung - Galaxy S, Galaxy Note, Galaxy A, Tablets'),
('Xiaomi', 'Produtos Xiaomi - Redmi, POCO, Mi'),
('Motorola', 'Produtos Motorola - Moto G, Edge'),
('JBL', 'Fones e caixas de som JBL'),
('Anker', 'Carregadores e cabos Anker'),
('Genérica', 'Produtos genéricos - Capinhas, Películas, Carregadores, Cabos');

-- Inserir categorias organizadas por marca
INSERT INTO categories (name, description) VALUES 
-- Apple
('iPhone', 'Smartphones iPhone da Apple'),
('iPad', 'Tablets iPad da Apple'), 
('Mac', 'Computadores Mac da Apple'),
('Watch', 'Apple Watch'),
('AirPods', 'Fones AirPods da Apple'),
('Acessórios Apple', 'Acessórios oficiais Apple'),
-- Samsung
('Galaxy S', 'Smartphones Galaxy S da Samsung'),
('Galaxy Note', 'Smartphones Galaxy Note da Samsung'),
('Galaxy A', 'Smartphones Galaxy A da Samsung'),
('Tablets Samsung', 'Tablets da Samsung'),
('Acessórios Samsung', 'Acessórios da Samsung'),
-- Xiaomi
('Redmi', 'Smartphones Redmi da Xiaomi'),
('POCO', 'Smartphones POCO da Xiaomi'),
('Mi', 'Smartphones Mi da Xiaomi'),
('Acessórios Xiaomi', 'Acessórios da Xiaomi'),
-- Motorola
('Moto G', 'Smartphones Moto G da Motorola'),
('Edge', 'Smartphones Edge da Motorola'),
-- Genérica
('Capinhas', 'Capinhas para celulares'),
('Películas', 'Películas protetoras'),
('Carregadores', 'Carregadores para dispositivos'),
('Cabos', 'Cabos USB e conectores'),
('Fones', 'Fones de ouvido genéricos');

-- Inserir alguns produtos Apple pré-cadastrados
INSERT INTO products (sku, description, brand_id, category_id, cost_price, sale_price, markup, min_stock, max_stock, requires_imei, warranty_months, location) VALUES
-- iPhones
('APPIPHON11128BL', 'Apple iPhone 11 128GB Preto', 1, 1, 2800.00, 3200.00, 14.29, 2, 20, 1, 12, 'A1-B2'),
('APPIPHON13PRO256AS', 'Apple iPhone 13 Pro 256GB Azul Sierra', 1, 1, 3500.00, 4200.00, 20.00, 2, 15, 1, 12, 'A1-B3'),
('APPIPHON14128MN', 'Apple iPhone 14 128GB Midnight', 1, 1, 3200.00, 3800.00, 18.75, 2, 20, 1, 12, 'A1-B4'),
('APPIPHON15128PR', 'Apple iPhone 15 128GB Preto', 1, 1, 3800.00, 4500.00, 18.42, 2, 15, 1, 12, 'A1-B5'),
-- AirPods
('APPAIRPRO2GEN', 'Apple AirPods Pro 2ª Geração', 1, 5, 1200.00, 1499.00, 24.92, 5, 30, 0, 12, 'A2-C1'),
('APPAIR3GER', 'Apple AirPods 3ª Geração', 1, 5, 900.00, 1199.00, 33.22, 5, 25, 0, 12, 'A2-C2'),
-- Apple Watch
('APPWATSER8GPS45', 'Apple Watch Series 8 GPS 45mm', 1, 4, 1800.00, 2199.00, 22.17, 3, 20, 0, 12, 'A3-A1'),
('APPWATSER9GPS41', 'Apple Watch Series 9 GPS 41mm', 1, 4, 2000.00, 2399.00, 19.95, 3, 15, 0, 12, 'A3-A2'),
-- iPad
('APPIPAD10GEN64', 'Apple iPad 10ª Geração 64GB', 1, 2, 1800.00, 2199.00, 22.17, 3, 15, 0, 12, 'A4-B1'),
('APPIPADAIR5GEN256', 'Apple iPad Air 5ª Geração 256GB', 1, 2, 2800.00, 3399.00, 21.39, 2, 10, 0, 12, 'A4-B2');
