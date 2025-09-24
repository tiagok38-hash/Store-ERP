
DELETE FROM products WHERE brand_id IN (SELECT id FROM brands WHERE name IN ('Apple', 'Samsung', 'Xiaomi', 'Motorola', 'JBL', 'Anker', 'Genérica'));
DELETE FROM categories WHERE name IN ('iPhone', 'iPad', 'Mac', 'Watch', 'AirPods', 'Acessórios Apple', 'Galaxy S', 'Galaxy Note', 'Galaxy A', 'Tablets Samsung', 'Acessórios Samsung', 'Redmi', 'POCO', 'Mi', 'Acessórios Xiaomi', 'Moto G', 'Edge', 'Capinhas', 'Películas', 'Carregadores', 'Cabos', 'Fones');
DELETE FROM brands WHERE name IN ('Apple', 'Samsung', 'Xiaomi', 'Motorola', 'JBL', 'Anker', 'Genérica');
