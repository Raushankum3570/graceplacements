# Steps to Fix the Google Auth Issue

There is a type mismatch between your Supabase auth_id column and the Google OAuth user ID format. Here's how to fix it:

## Option 1: Using the Debugging Tool (Recommended)

1. Go to the Google Authentication Debugger page at [/google-auth-debug](/google-auth-debug)
2. Check the "Database Schema Check" section - it should show that your auth_id column has the wrong type (bigint instead of UUID)
3. Click the "Execute Direct Fix" button which will:
   - Drop the auth_id column
   - Re-create it with the correct UUID type
   - Add any other missing columns needed for Google authentication
4. Once the fix is applied, try signing in with Google again

## Option 2: Run SQL Manually

If you prefer to fix it directly in the Supabase SQL editor:

```sql
-- Drop the current auth_id column entirely
ALTER TABLE public."Users" DROP COLUMN IF EXISTS auth_id;
          
-- Add the column back with correct UUID type
ALTER TABLE public."Users" ADD COLUMN auth_id UUID;
          
-- Make sure other columns exist too
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS picture TEXT;
```

## Verifying the Fix

After applying either fix, sign in with Google again and verify that:

1. You are successfully authenticated
2. Your user profile data (name, picture) is properly stored in the database
3. The auth_id column correctly contains your Google user ID as a UUID

## Technical Details

The error happened because:
- The auth_id column was created as a `bigint` type
- Google Authentication generates UUIDs (like "ae95fbd1-172e-4d17-af00-ee27c8ac11d4")
- When your code tried to save the UUID string to a bigint column, Postgres rejected it with "invalid input syntax for type bigint"

This fix ensures the column type matches the data format that Google Auth provides.
