-- Simple direct fix for auth_id column type issues
-- Run this in the Supabase SQL Editor

-- First make sure the extensions we need are installed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Drop the problematic column (ignore errors if it doesn't exist)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public."Users" DROP COLUMN auth_id;
    RAISE NOTICE 'Dropped existing auth_id column';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'auth_id column does not exist yet';
  END;
END $$;

-- Step 2: Create a new column with the correct type
ALTER TABLE public."Users" ADD COLUMN auth_id UUID;

-- Step 3: Add any other missing columns needed for Google Auth
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS picture TEXT;

-- Step 4: Verify the change worked
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type 
  FROM information_schema.columns 
  WHERE table_name = 'Users' AND column_name = 'auth_id';
  
  RAISE NOTICE 'auth_id column is now type: %', col_type;
  
  IF col_type = 'uuid' THEN
    RAISE NOTICE 'FIX SUCCESSFUL: auth_id column is now UUID type';
  ELSE
    RAISE NOTICE 'FIX FAILED: auth_id column is not UUID type';
  END IF;
END $$;
