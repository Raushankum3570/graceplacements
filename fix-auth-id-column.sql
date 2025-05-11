-- SQL to fix the auth_id column type in the Users table
-- This script addresses the error: "invalid input syntax for type bigint"

-- Option 1: Try to convert the existing column (may fail if data can't be converted)
DO $$
BEGIN
  -- First attempt: Try to convert directly
  BEGIN
    ALTER TABLE public."Users"
      ALTER COLUMN auth_id TYPE UUID USING auth_id::text::uuid;
    EXCEPTION WHEN others THEN
      -- If direct conversion fails, we'll handle it in the next step
      RAISE NOTICE 'Could not convert directly, will try alternative approach';
  END;
END $$;

-- Option 2: If conversion fails, recreate the column
DO $$
BEGIN
  -- Check if conversion was successful
  DECLARE
    column_type text;
  BEGIN
    SELECT data_type INTO column_type 
    FROM information_schema.columns 
    WHERE table_name = 'Users' AND column_name = 'auth_id';
    
    -- If still bigint, drop and recreate
    IF column_type = 'bigint' THEN
      ALTER TABLE public."Users" DROP COLUMN auth_id;
      ALTER TABLE public."Users" ADD COLUMN auth_id UUID;
      RAISE NOTICE 'Recreated auth_id column as UUID type';
    ELSE
      RAISE NOTICE 'Column conversion was successful';
    END IF;
  END;
END $$;

-- Add missing provider column if needed
DO $$
BEGIN
  BEGIN
    ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS provider TEXT;
    RAISE NOTICE 'Added provider column if it was missing';
  EXCEPTION WHEN duplicate_column THEN
    RAISE NOTICE 'provider column already exists';
  END;
END $$;

-- Add missing picture column if needed
DO $$
BEGIN
  BEGIN
    ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS picture TEXT;
    RAISE NOTICE 'Added picture column if it was missing';
  EXCEPTION WHEN duplicate_column THEN
    RAISE NOTICE 'picture column already exists';
  END;
END $$;
