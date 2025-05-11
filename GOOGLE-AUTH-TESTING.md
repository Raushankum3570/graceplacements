# Testing Google Authentication

This document outlines the steps to test the Google authentication feature in Grace Placement.

## Local Development Testing

1. Ensure you have set up Google OAuth credentials correctly according to the `GOOGLE-AUTH-SETUP.md` guide
2. Verify your environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://aunmhtifhqlyqwbphvxv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open `http://localhost:3000/auth` in your browser
5. Click the "Continue with Google" button
6. You should be redirected to Google's authentication page
7. After successful authentication, you should be redirected back to the application

## Production Testing

1. Ensure you have added the production URL to your Google OAuth credentials
2. Verify your environment variables in your production environment (e.g., Vercel)
3. Deploy your application
4. Visit your production URL (e.g., `https://grace-placement.vercel.app/auth`)
5. Click the "Continue with Google" button
6. Follow the same authentication flow as in local development

## Expected Behavior

- Clicking the Google button should redirect to Google's authentication page
- After successful authentication, users should be redirected back to the application
- New users (first-time login with Google) should have a record created in the Users table
- Users with admin emails should be redirected to `/admin`
- Regular users should be redirected to the homepage (`/`)

## Common Issues

### Redirect URI Mismatch

If you see an error like "redirect_uri_mismatch" or "invalid_request", check:
1. That the redirect URI configured in Google Cloud Console exactly matches what's sent by the application
2. That you've added all necessary redirect URIs for different environments

### No Response After Clicking Google Button

Check your browser console for errors:
1. Make sure Supabase client is correctly initialized
2. Verify the Google Client ID is correctly set in environment variables
3. Check if there are any CORS issues

### Authentication Works Locally But Not in Production

1. Ensure production URLs are added to the authorized redirect URIs in Google Cloud Console
2. Verify environment variables are correctly set in the production environment
3. Check that you're using the correct provider configuration for production

## Testing Different User Types

1. **Regular User**: Use a non-admin email to sign in
2. **Admin User**: Use an email containing "admin" or "gracecoe.org" to sign in and verify that you're redirected to the admin panel
