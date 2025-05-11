# Google Authentication with Supabase

This document details how Google authentication is implemented in the Grace Placement application using Supabase.

## Key Components

1. **Authentication Flow**:
   - Users can sign in with their Google accounts
   - User profile data from Google is stored in Supabase database
   - Profile picture and name are displayed in the navigation bar

2. **Data Storage**:
   - Google profile data (name, email, picture) is stored in the Users table
   - Authentication metadata is preserved for future use
   - Provider information is tracked to differentiate auth methods

3. **UI Integration**:
   - Profile pictures from Google are displayed in the navbar
   - User's name from Google profile is shown next to their picture
   - Admin status is determined based on email domain and stored in the database

## Implementation Details

### Login Process

1. User clicks "Continue with Google" button
2. Supabase redirects to Google OAuth consent screen
3. Upon authorization, Google redirects back to our application
4. Callback handler checks if user exists in our database:
   - If new user: Creates a record with Google profile data
   - If existing user: Updates their record with latest Google profile data
5. User is redirected based on their access level (regular/admin)

### Profile Display in Navbar

1. The navbar component fetches the current authenticated user
2. If user has a profile picture from Google, it's displayed in a circle
3. If no picture is available, user's initial is shown in a colored circle
4. User's name from Google profile is displayed next to the picture
5. Dropdown menu provides options like "Sign Out"

### Database Schema

The Users table includes fields specifically for Google authentication:
- `picture`: URL to user's Google profile picture
- `provider`: Authentication method ('google' or 'email')
- `auth_id`: Reference to Supabase auth.users table
- `last_sign_in`: Timestamp of most recent login

## Code Structure

1. **GoogleButton.jsx**: Reusable button component for Google sign-in
2. **auth/page.jsx**: Implements signInWithGoogle and handleUserAfterOAuth functions
3. **NavbarAuth.js**: Helper functions for fetching and processing user data
4. **Navbar.jsx**: UI component that displays user profile and handles sign-out

## Troubleshooting

If Google authentication is not working properly:

1. Check that Google OAuth is enabled in Supabase dashboard
2. Verify Google Client ID is correctly set in environment variables
3. Ensure redirect URLs are correctly configured in Google Cloud Console
4. Check browser console for any authentication errors
5. Verify the Users table has the necessary columns for storing Google profile data
