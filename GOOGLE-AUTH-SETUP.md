# Setting Up Google Authentication for Grace Placement

This guide walks you through the process of setting up Google OAuth for the Grace Placement application.

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Configure Consent Screen"
   - Choose "External" user type
   - Fill in the required information (App name, user support email, developer contact)
   - Add the email scope (`./auth/userinfo.email`)
   - Save and continue

## 2. Create OAuth Client ID

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add a name for your client (e.g., "Grace Placement Web Client")
5. Add authorized JavaScript origins:
   - Local development: `http://localhost:3000`
   - Production: `https://grace-placement.vercel.app` (and any other deployment URLs)
6. Add authorized redirect URIs:
   - Local development: `http://localhost:3000/auth` 
   - Production: `https://grace-placement.vercel.app/auth` (and other deployment URLs)
   - Also add your Supabase authentication callback URL: `https://aunmhtifhqlyqwbphvxv.supabase.co/auth/v1/callback`
7. Click "Create" and note your Client ID and Client Secret

## 3. Configure Supabase Authentication

1. Sign in to your [Supabase dashboard](https://app.supabase.com/)
2. Select your project
3. Go to "Authentication" > "Providers"
4. Find "Google" in the list and enable it
5. Enter the Client ID and Client Secret from Google Cloud Console
6. Set redirect URL to: `https://aunmhtifhqlyqwbphvxv.supabase.co/auth/v1/callback`
7. Save the changes

## 4. Update Environment Variables

Update your environment variables in both development (.env.local) and production (.env.production) environments:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://aunmhtifhqlyqwbphvxv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # or production URL
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 5. Testing

1. Start your application locally using `npm run dev`
2. Try signing in with Google
3. Ensure it works correctly in both development and production environments

## Troubleshooting

- If you see "Error: redirect_uri_mismatch", double-check that the redirect URI in your Google Cloud Console matches exactly with what Supabase is sending (check network requests during login)
- If no redirect happens after clicking the Google button, verify that your Supabase client is correctly configured
- Check browser console for any JavaScript errors

## Important Notes

- Different deployment environments (staging, preview, production) may need their own redirect URIs added to Google Cloud Console
- Keep your client secret confidential and never expose it in client-side code
