# Fixing Supabase Database Authentication Issues

This document explains how to fix the error: "relation 'public.Users' does not exist" in your Supabase application by creating the missing Users table.

## Problem

Your application is trying to access a table called `Users` in your Supabase database, but this table doesn't exist. This is causing authentication failures and errors like:

```
relation 'public.Users' does not exist
```

## Solution

### Step 1: Create the Users Table in Supabase

1. Log into your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the "SQL Editor" tab in the left sidebar
4. Create a "New Query"
5. Copy and paste the contents from the `create-users-table.sql` file we've created in your project
6. Run the query to create the Users table and set up permissions

### Step 2: Verify the Table Creation

1. In the Supabase dashboard, go to the "Table Editor" tab
2. You should see a `Users` table in the list
3. Verify that it has the correct columns:
   - `id` (UUID, primary key)
   - `email` (TEXT, unique)
   - `name` (TEXT)
   - `picture` (TEXT)
   - `is_admin` (BOOLEAN)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### Step 3: Test Authentication in Your Application

After creating the table:

1. Try to authenticate with your application again
2. Check if the sign-up and sign-in processes are working
3. Verify that user data is being stored in the Users table

## Troubleshooting

If you still encounter issues:

1. **Email Authentication**: Make sure email authentication is enabled in Supabase (refer to SUPABASE-AUTH-CONFIG.md)
2. **Dashboard Check**: In the Supabase dashboard, go to Authentication → Settings → Email and ensure "Enable Email Sign In" is turned on
3. **Database Permissions**: Ensure RLS (Row Level Security) policies are correctly set up (they're included in the SQL script)

## For Future Development

To avoid this issue in future deployments, consider:

1. Creating a database migration system for your project
2. Using a schema.sql file that's included in your project repository
3. Creating a setup script that initializes your database with all required tables when deploying to a new environment
