
DROP TABLE audit_logs;
DROP TABLE stock_movements;
ALTER TABLE products DROP COLUMN location;
ALTER TABLE products DROP COLUMN max_stock;
ALTER TABLE products DROP COLUMN min_stock;
ALTER TABLE products DROP COLUMN warranty_months;
ALTER TABLE products DROP COLUMN variation_id;
ALTER TABLE products DROP COLUMN brand_id;
ALTER TABLE products DROP COLUMN category_id;
DROP TABLE variations;
DROP TABLE brands;
DROP TABLE categories;
