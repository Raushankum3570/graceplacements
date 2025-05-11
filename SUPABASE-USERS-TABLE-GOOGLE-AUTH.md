# Supabase Users Table Schema for Google OAuth

This document provides the SQL commands and schema information for enhancing your Users table in Supabase to work with Google OAuth authentication.

## Current Table Structure

Your Users table should already exist with basic fields. We're enhancing it to store Google profile information.

## Required Fields for Google OAuth

These are the fields your Users table should have to properly work with Google authentication:

```sql
CREATE TABLE IF NOT EXISTS public."Users" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,                      -- URL to user's profile picture from Google
  provider TEXT,                     -- 'google', 'email', etc.
  auth_id UUID,                      -- Supabase auth.users.id reference
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_sign_in TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## How to Update Your Existing Table

If you already have a Users table, you can add the missing columns:

```sql
-- Add column for profile picture
ALTER TABLE public."Users"
ADD COLUMN IF NOT EXISTS picture TEXT;

-- Add column for authentication provider
ALTER TABLE public."Users"
ADD COLUMN IF NOT EXISTS provider TEXT;

-- Add column for Supabase auth ID reference
ALTER TABLE public."Users"
ADD COLUMN IF NOT EXISTS auth_id UUID;

-- Add column for last sign-in timestamp
ALTER TABLE public."Users"
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMP WITH TIME ZONE;

-- Add column for record update timestamp
ALTER TABLE public."Users"
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
```

## Row-Level Security (RLS) Policies

To secure your table with Row-Level Security:

```sql
-- Enable Row Level Security
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting users (allow all authenticated users to view other users)
CREATE POLICY "Allow users to view all users" 
  ON public."Users" FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy for inserting own user data
CREATE POLICY "Allow users to insert their own record" 
  ON public."Users" FOR INSERT 
  WITH CHECK (auth.uid()::text = auth_id::text OR email = auth.jwt()->>'email');

-- Create policy for updating own user data
CREATE POLICY "Allow users to update own record" 
  ON public."Users" FOR UPDATE 
  USING (auth.uid()::text = auth_id::text OR email = auth.jwt()->>'email');
```

## Triggers (Optional)

You can add a trigger to automatically update the `updated_at` column:

```sql
-- Create function for updating timestamp
CREATE OR REPLACE FUNCTION public.update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamp on record update
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON public."Users"
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();
```

## How to Run These Commands

1. Go to your Supabase dashboard
2. Select your project
3. Go to the SQL Editor
4. Paste the relevant SQL commands
5. Run the commands to update your database schema
