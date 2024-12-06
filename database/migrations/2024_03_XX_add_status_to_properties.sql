ALTER TABLE properties
ADD COLUMN status ENUM('available', 'sold', 'rented', 'cancelled') NOT NULL DEFAULT 'available',
ADD COLUMN buyer_id bigint(20) unsigned DEFAULT NULL,
ADD COLUMN transaction_date timestamp NULL DEFAULT NULL; 