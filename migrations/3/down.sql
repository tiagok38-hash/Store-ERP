
DELETE FROM system_settings;
DELETE FROM payment_methods;
DELETE FROM brands;
DELETE FROM categories;
DROP TABLE system_settings;
DROP TABLE payment_methods;
ALTER TABLE users DROP COLUMN password_hash;
ALTER TABLE users DROP COLUMN last_login;
ALTER TABLE users DROP COLUMN permissions;
