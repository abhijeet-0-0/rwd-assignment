-- Migration script to update existing bookings table
-- Run this if you get "Unknown column 'booking_date'" error
-- Usage: mysql -u root -p < database_update.sql

USE flight_booking;

-- Add booking_date column if it doesn't exist
-- Note: MySQL doesn't support IF NOT EXISTS for ALTER TABLE, so we'll try to add it
-- If the column already exists, you'll get an error but that's okay - just continue

-- Try to add booking_date (ignore error if it already exists)
ALTER TABLE bookings ADD COLUMN booking_date DATE AFTER destination;

-- Try to add passenger_name (ignore error if it already exists)
ALTER TABLE bookings ADD COLUMN passenger_name VARCHAR(100) AFTER price;

-- Try to add passenger_age (ignore error if it already exists)
ALTER TABLE bookings ADD COLUMN passenger_age INT AFTER passenger_name;

-- Try to add seat_number (ignore error if it already exists)
ALTER TABLE bookings ADD COLUMN seat_number VARCHAR(10) AFTER passenger_age;

-- Try to add created_at (ignore error if it already exists)
ALTER TABLE bookings ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER seat_number;

-- Update existing rows to have a booking_date if it's NULL
UPDATE bookings SET booking_date = DATE(created_at) WHERE booking_date IS NULL;
