-- SQL Schema Setup for Apex Wheels (Supabase / PostgreSQL)
-- Copy-paste these SQL queries inside the Supabase SQL Editor and click "Run".

-- 1. Drop existing tables if they exist (Order matters due to Foreign Keys)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create Users Table
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' NOT NULL,
  plan VARCHAR(50) DEFAULT 'free' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create Cars Table
CREATE TABLE cars (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  transmission VARCHAR(100) NOT NULL,
  fuel_type VARCHAR(100) NOT NULL,
  seats INTEGER NOT NULL,
  price_per_day NUMERIC NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  rental_type VARCHAR(100) DEFAULT 'standard' NOT NULL,
  rating NUMERIC DEFAULT 0 NOT NULL,
  reviews INTEGER DEFAULT 0 NOT NULL,
  available BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create Bookings Table
CREATE TABLE bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  car_id BIGINT REFERENCES cars(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_days INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
  razorpay_order_id VARCHAR(255) NOT NULL,
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
