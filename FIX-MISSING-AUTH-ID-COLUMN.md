# Fix for Incorrect auth_id Column Type

This document explains how to fix the error: "invalid input syntax for type bigint" in your Supabase application when using Google authentication.

## The Problem

You're experiencing this error because your database has the `auth_id` column defined with the wrong data type:

- Your `auth_id` column in the Users table is defined as a `bigint` type
- But Supabase Auth generates UUIDs (strings like "ae95fbd1-172e-4d17-af00-ee27c8ac11d4")
- When trying to save a UUID string to a bigint column, you get a type mismatch error

## Error Messages You Might See

```
Error: invalid input syntax for type bigint: "ae95fbd1-172e-4d17-af00-ee27c8ac11d4"
```

Or:

```
Error updating Google user data: "Could not find the 'provider' column of 'Users' in the schema cache"
```

## How to Fix This

### Option 1: Using the Debugging Tool (Recommended)

1. Go to the [Google Authentication Debugger](/google-auth-debug) page in your application.

2. Check the "Database Schema Check" section to confirm if:
   - The `auth_id` column exists
   - It shows "Wrong type! Should be UUID" error

3. Click the "Repair Database Schema" button which will:
   - Attempt to convert the existing column to UUID type
   - If that fails, it will drop and recreate the column with the correct type

4. After fixing the column, try signing in with Google again.

### Option 2: Manual SQL Fix

If the automatic fix doesn't work, you need to run this SQL in your Supabase SQL Editor:

```sql
-- Drop the existing auth_id column
ALTER TABLE public."Users" DROP COLUMN IF EXISTS auth_id;

-- Add the column back with the correct UUID type
ALTER TABLE public."Users" ADD COLUMN auth_id UUID;

-- Add missing provider column if needed
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS provider TEXT;

-- Add missing picture column if needed
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS picture TEXT;
```

## Diagnosing the Issue

If you're trying to understand more about the database structure:

```sql
-- Check column types in the Users table
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'Users'
AND column_name IN ('auth_id', 'provider', 'picture');
```

## Preventing Future Issues

To avoid similar issues in the future:

1. Always use the correct column types for authentication data:
   - `auth_id`: UUID type (not bigint or integer)
   - `provider`: text type
   - `picture`: text type

2. Consider using database migrations to manage schema changes consistently.

3. Test authentication flows thoroughly after any database schema changes.

## Additional Resources

For more detailed information about the required table structure, see:
- [SUPABASE-USERS-TABLE-GOOGLE-AUTH.md](./SUPABASE-USERS-TABLE-GOOGLE-AUTH.md)
- [GOOGLE-AUTH-DEBUGGING.md](./GOOGLE-AUTH-DEBUGGING.md)