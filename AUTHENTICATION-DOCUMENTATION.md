# Authentication System Documentation

## Overview

The Grace Placement Management System uses a dual authentication system:

1. **Regular Authentication**: For students and other users
2. **Admin Authentication**: For administrators only

**Important Update**: The authentication system now supports immediate sign-in without email verification for all users. We've created a new enhanced auth page at `/new-auth` and also updated the original auth page.

## Authentication Flows

### Regular User Authentication

- Located at `/auth` route
- Features:
  - Email/password sign-up and sign-in only
  - No Google OAuth or other social sign-in methods
  - **Works for ALL email addresses**, including admin emails
  - Normal users marked as non-admin (`is_admin: false`)
  - Admin emails are automatically recognized and granted admin privileges when they sign up or sign in
  - Link to admin auth page for administrator convenience
  - Admin users who sign in through the regular auth page receive a notification and are redirected to the admin dashboard

### Admin Authentication

- Located at `/admin-auth` route
- Restricted to specific email addresses defined in `ADMIN_EMAILS`
- Features:
  - Email whitelist verification before attempting sign-in
  - Special metadata and database flags set upon successful authentication
  - Automatic redirection to admin dashboard

## Implementation Details

### Admin Email List

The list of authorized admin emails is centralized in `lib/admin.js` and exported as `ADMIN_EMAILS`:

```javascript
// From lib/admin.js
export const ADMIN_EMAILS = [
  'admin@gracecoe.org',
  'principal@gracecoe.org',
  'placement.officer@gracecoe.org',
  'dean@gracecoe.org',
  'tech.admin@gracecoe.org',
  '950321104040@gracecoe.org',
  '950321104020@gracecoe.org'
];
```

### Session and User Data Handling

User authentication data is managed through `NavbarAuth.js` which provides robust error handling and consistent user data access:

```javascript
// From NavbarAuth.js
export async function getSessionAndUser() {
  // Safe session and user data retrieval with fallbacks
  // Verifies admin status from multiple sources: email list, metadata, and database record
  // Always returns consistent user data objects with proper admin flags
}
```

This helper ensures that admin users are properly recognized regardless of which authentication route they use.

### Role-Based Redirection

The application implements automatic redirection based on user roles:

- Admin users trying to access `/auth` are redirected to `/admin`
- Regular users trying to access `/admin/*` are redirected to home
- Unauthenticated users trying to access protected routes are redirected to `/auth`

### Authentication Events

Communication between components about authentication state is handled through custom events:

```javascript
// Example of dispatching auth event
const authEvent = new CustomEvent('supabase-auth-update', {
  detail: { action: 'signed_in' }
});
window.dispatchEvent(authEvent);
```

## Testing Authentication

You can test the authentication system using the `test-auth.js` script by running it in your browser's developer console when logged in.

## Enhanced Authentication Features

### New Authentication Pages

We've created several new authentication pages and utilities to improve the user experience:

- **`/new-auth`**: Improved authentication page with automatic sign-in after registration
- **`/fix-auth`**: Central dashboard with links to all authentication-related tools
- **`/env-check`**: Tool to verify that Supabase environment variables are set correctly
- **`/auth-debug`**: Run tests to diagnose authentication issues
- **`/quick-signin`**: Simple sign-in form for direct authentication testing
- **`/account-manager`**: Create, check or delete user accounts for testing
- **`/create-user`**: Tool to create users directly in the database

### Email Verification Bypass

The system is now configured to allow sign-in immediately after registration without requiring email verification. This is achieved through:

1. The `new-auth` page which handles sign-up and immediate sign-in in one flow
2. Modified `auth` page that attempts an automatic sign-in after registration
3. Customized Supabase client configuration in `services/supabaseClient.js`

### Troubleshooting Common Issues

#### "Invalid login credentials" Error

This typically occurs when:
- Email verification is still required but not completed
- The user account doesn't exist
- The password is incorrect

**Solution**: 
- Use the `/new-auth` page which handles sign-up without verification
- Use the `/account-manager` to verify if the account exists
- Try resetting the password if you've forgotten it

#### "Email not confirmed" Error

This occurs when Supabase is enforcing email verification.

**Solution**:
- Use the `/new-auth` page which handles this automatically
- Check your email for a verification link
- Use the account manager to create a test account

## Security Considerations

- Admin access is verified by email address, metadata flags, and database records
- Multiple verification points ensure consistent admin status throughout the application
- Error handling ensures the system fails safely without exposing unauthorized content
