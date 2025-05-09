# Authentication System Overview

## User Authentication Flow

1. **User Sign In/Sign Up**
   - Users authenticate through email/password only
   - Google OAuth removed for simplicity
   - After successful login, users are redirected to home page
   - Only authenticated users can access protected routes

2. **Admin Authentication**
   - Admins have a separate login page at `/admin-auth` 
   - Admin access is restricted to authorized email addresses
   - Admin users are redirected to the admin dashboard after login
   - Non-admin users attempting admin login are redirected to the main application

## Key Changes Made

1. **Auth Page (app/auth/page.jsx)**
   - Removed Google OAuth integration
   - Removed admin link from user authentication page
   - Simplified to only email/password authentication

2. **Admin Authentication (app/admin-auth/page.jsx)**
   - Updated to use email/password login
   - Added admin-specific redirects and error handling
   - Enhanced security by checking email against admin list

3. **Admin Protection (lib/admin.js)**
   - Enhanced admin user detection with multiple fallbacks
   - Added redirection utility based on user role and current page
   - Updated admin email list

4. **Provider (app/provider.jsx)**
   - Added proper path-based routing to handle admin vs. regular users
   - Improved sign-out flow for admin vs. regular users
   - Enhanced event broadcasting for auth state changes

## Admin Email List
Approved admin emails are defined in `lib/admin.js`:
- admin@gracecoe.org
- principal@gracecoe.org
- placement.officer@gracecoe.org
- dean@gracecoe.org
- tech.admin@gracecoe.org
- 950321104040@gracecoe.org
- 950321104020@gracecoe.org
