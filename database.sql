CREATE DATABASE IF NOT EXISTS flight_booking;
USE flight_booking;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS flights (
  flight_id INT AUTO_INCREMENT PRIMARY KEY,
  flight_name VARCHAR(50),
  source VARCHAR(50),
  destination VARCHAR(50),
  departure VARCHAR(20),
  arrival VARCHAR(20),
  price INT
);

CREATE TABLE IF NOT EXISTS bookings (
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

INSERT INTO flights 
(flight_name, source, destination, departure, arrival, price) VALUES
('AirX 101','Bangalore','Mumbai','08:00 AM','10:30 AM',3500),
('SkyJet 202','Bangalore','Mumbai','12:00 PM','02:30 PM',3700),
('FlyHigh 303','Delhi','Mumbai','06:00 PM','08:30 PM',4000),
('AirX 201','Mumbai','Bangalore','09:00 AM','11:30 AM',3500),
('SkyJet 301','Delhi','Bangalore','10:00 AM','12:30 PM',4500),
('FlyHigh 102','Hyderabad','Mumbai','02:00 PM','04:30 PM',4200),
('AirX 201','Mumbai','Hyderabad','09:00 AM','11:30 AM',3500),
('SkyJet 301','Kolkata','Bangalore','10:00 AM','12:30 PM',4500),
('FlyHigh 102','Kolkata','Delhi','02:00 PM','04:30 PM',4200);