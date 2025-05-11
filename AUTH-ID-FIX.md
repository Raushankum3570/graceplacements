# Auth-ID Fix Tool

This tool helps you fix issues with the `auth_id` column in your Supabase database.

## The Issue

You're currently experiencing this error:
```
Error updating user profile: "invalid input syntax for type double precision: \"ae95fbd1-172e-4d17-af00-ee27c8ac11d4\""
```

This happens because:
1. The `auth_id` column in your Users table is defined as a numeric type (bigint or double precision)
2. Google Auth generates UUID strings (like "ae95fbd1-172e-4d17-af00-ee27c8ac11d4")
3. These can't be converted to each other automatically

## How We've Fixed It

We've modified your code to:
1. Stop storing auth_id values in the database 
2. Skip auth_id updates in both provider.jsx and the google-auth-debug page

This approach means you can continue using Google authentication without errors.

## If You Want to Store auth_id Values in Future

If you decide you want to store auth_id values later, you'll need to fix the database column. You can:

1. Use the Google Auth Debugger page at /google-auth-debug and click "Execute Direct Fix"

OR

2. Run this SQL in your Supabase SQL Editor:
```sql
-- Drop the current auth_id column entirely
ALTER TABLE public."Users" DROP COLUMN IF EXISTS auth_id;
          
-- Add the column back with correct UUID type
ALTER TABLE public."Users" ADD COLUMN auth_id UUID;
```

After fixing the column type, you can restore the auth_id updates in your code.
