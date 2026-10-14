-- car_cost: the transfer price a travel booking pays its own car pool, entered on
-- the travel booking (beside cost_except_car). Drives the two-pot split (FE):
--   travel_net = gross − cost_except_car − car_cost − commission   (→ travel pot)
--   car_net    = car_cost − fare − toll − driver_cost              (→ car pot)
-- car_cost cancels across the two pots; fare/toll/driver are the car's real costs.
ALTER TABLE travel_bookings ADD COLUMN car_cost INTEGER NOT NULL DEFAULT 0;
