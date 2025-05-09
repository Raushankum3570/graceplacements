# Supabase Authentication Configuration Guide

## Issue: "Email logins are disabled"

If you're seeing the error message `AuthApiError: Email logins are disabled` when trying to sign in or sign up, it means your Supabase project is not configured to allow email authentication.

## How to Fix

### 1. Enable Email Provider in Supabase Dashboard

1. **Access Supabase Dashboard**
   - Go to [https://app.supabase.io](https://app.supabase.io)
   - Sign in with your Supabase account
   - Select your project

2. **Navigate to Authentication Settings**
   - In the left sidebar, click on **Authentication**
   - Select **Providers** from the submenu

3. **Enable Email Provider**
   - Find the **Email** provider in the list
   - Make sure it's enabled (toggle switch should be in the ON position)
   - Enable **Email/Password Sign Up** option if available

4. **Configure Email Settings**
   - If needed, configure additional email settings:
     - Site URL
     - Redirect URLs
     - Email templates

5. **Save Changes**
   - Click "Save" button to apply your changes

### 2. Test Authentication

After enabling email authentication in the Supabase dashboard, test your authentication by:

1. Visit the `/auth-config` page in your application to verify the configuration
2. Try signing in or signing up on the authentication pages (`/auth` or `/new-auth`)

## Additional Authentication Options

If you prefer not to use email authentication, Supabase supports other authentication providers:

- **Google, GitHub, Facebook** etc. (OAuth providers)
- **Phone authentication** (SMS OTP)
- **Magic Link** (passwordless email link)

To enable these:
1. Go to the **Providers** page in your Supabase Authentication settings
2. Enable the desired providers
3. Configure any required API keys or credentials

## Troubleshooting

If you still have authentication issues after enabling email logins, try:

1. **Check Environment Variables**
   - Visit the `/env-check` page to verify your Supabase URL and API keys

2. **Test with Debug Tools**
   - Use the `/auth-debug` page to diagnose authentication issues
   - Try the `/account-manager` to create test accounts

3. **Clear Browser Storage**
   - Clear localStorage and sessionStorage in your browser
   - Clear cookies for your domain

4. **Check Network Requests**
   - Use browser developer tools (F12) to inspect network requests
   - Look for errors in the console

5. **Check for CORS Issues**
   - If developing locally, ensure your local domain is allowed in Supabase settings

## Reference Docs

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Authentication Guide](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase Authentication Helpers](https://supabase.com/docs/guides/auth/auth-helpers)