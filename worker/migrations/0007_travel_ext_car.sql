-- External-car details for a travel booking that uses a NON-fleet (vendor) car.
-- Descriptive only — these columns do NOT affect any pot / pending / revenue math.
-- The external-car money flow is unchanged (MONEY_FLOW.md §3 case D2): car_cost
-- still reduces the travel pot and funds no car pot; car_included stays 0 for an
-- external car. A fleet car (car_included=1) uses the linked car_bookings row
-- instead and leaves these three NULL.
ALTER TABLE travel_bookings ADD COLUMN ext_driver  TEXT;
ALTER TABLE travel_bookings ADD COLUMN ext_car_no  TEXT;
ALTER TABLE travel_bookings ADD COLUMN ext_contact TEXT;
