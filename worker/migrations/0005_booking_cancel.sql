-- Booking cancellation. Bookings are never deleted; a cancelled row keeps all its
-- data but is excluded from every pot / pending / revenue figure (all FE-computed).
-- cancelled 0/1 flag + audit (when, optional reason). Added to both booking streams
-- (car now has UI; travel wires its UI later — dashlib already excludes cancelled).
ALTER TABLE car_bookings    ADD COLUMN cancelled     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE car_bookings    ADD COLUMN cancelled_at  TEXT;
ALTER TABLE car_bookings    ADD COLUMN cancel_reason TEXT;
ALTER TABLE travel_bookings ADD COLUMN cancelled     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE travel_bookings ADD COLUMN cancelled_at  TEXT;
ALTER TABLE travel_bookings ADD COLUMN cancel_reason TEXT;
