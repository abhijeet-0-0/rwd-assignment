-- COMPLETE RESET: Drop and recreate bookings table
-- WARNING: This will DELETE ALL EXISTING BOOKINGS!
-- Only use this if you don't have important data or want a fresh start
-- Usage: mysql -u root -p < database_reset.sql

USE flight_booking;

DROP TABLE IF EXISTS bookings;

CREATE TABLE bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(100),
  flight_name VARCHAR(50),
  source VARCHAR(50),
  destination VARCHAR(50),
  booking_date DATE,
  passengers INT,
  price INT,
  passenger_name VARCHAR(100),
  passenger_age INT,
  seat_number VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
