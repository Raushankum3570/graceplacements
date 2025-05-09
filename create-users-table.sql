-- Users table creation script for Supabase
-- This script creates the Users table referenced in the application

-- First, check if the table exists and drop it if needed (comment this out if you want to preserve existing data)
-- DROP TABLE IF EXISTS "public"."Users";

-- Create the Users table
CREATE TABLE IF NOT EXISTS "public"."Users" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON "public"."Users" (email);

-- Enable Row Level Security
ALTER TABLE "public"."Users" ENABLE ROW LEVEL SECURITY;

-- Create policies for row level security
-- Allow users to select their own data
CREATE POLICY "Users can view own data" ON "public"."Users"
  FOR SELECT USING (auth.uid()::text = email);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert" ON "public"."Users"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON "public"."Users"
  FOR UPDATE USING (auth.uid()::text = email);

-- Admin users can view all data
CREATE POLICY "Admin users can view all data" ON "public"."Users"
  FOR SELECT USING (is_admin = true);

-- After running this script, the application should work correctly with the Users table
