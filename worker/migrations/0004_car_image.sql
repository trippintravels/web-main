ALTER TABLE car_models ADD COLUMN image_url TEXT;
UPDATE car_models SET image_url = 'car-models/innova.webp' WHERE id = 64;  -- Innova Crysta
UPDATE car_models SET image_url = 'car-models/dzire.webp'  WHERE id = 8;   -- Dzire