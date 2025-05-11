# Google Authentication Debugging Guide

If you encounter issues with Google authentication in the application, follow these steps to debug the problem.

## 1. Check Console Logs

Open your browser's developer tools (F12 or right-click > Inspect) and check the console for error messages. Look for:

- Error messages related to Supabase
- OAuth redirect issues
- Database operation failures

## 2. Check Network Requests

In the browser's developer tools, go to the Network tab and filter for:

- Requests to `auth/v1/token` (OAuth token exchange)
- Requests to `rest/v1/Users` (database operations)

## 3. Common Issues and Solutions

### Empty Error Object (`{}`)

If you see `Error updating Google user data: {}`, it may indicate:

- A schema mismatch between the expected fields and the actual database schema
- A missing column in the Users table
- A type conversion issue (e.g., trying to store a string in an integer field)

**Solution:**
- Check that your Users table has the required columns: `picture`, `provider`, and `auth_id`
- Make sure column types match the data you're trying to store

### OAuth Redirect Issues

If redirects fail or you see CORS errors:

**Solution:**
- Verify that your redirect URIs in Google Cloud Console match your application URLs
- Check that the authorized JavaScript origins include your domain
- For local testing, always use `http://localhost:3000` (not 127.0.0.1)

### Missing Profile Data

If user profile picture or name aren't displaying:

**Solution:**
- Check the user metadata in the supabase auth dashboard
- Ensure you're requesting the right scopes (`profile email`)
- Look for `avatar_url`, `picture`, `full_name`, or `name` in the user metadata

## 4. Testing Your Configuration

Run the following code in your browser console to diagnose issues:

```javascript
async function testGoogleAuth() {
  const { data: session } = await window.supabase.auth.getSession();
  console.log("Current session:", session);
  
  if (session?.user) {
    console.log("Auth metadata:", session.user.app_metadata);
    console.log("User metadata:", session.user.user_metadata);
    
    // Test database query
    const { data, error } = await window.supabase
      .from('Users')
      .select('*')
      .eq('email', session.user.email)
      .single();
      
    console.log("Database user:", data);
    console.log("Database error:", error);
  }
}

testGoogleAuth();
```

## 5. Last Resort: Reset and Recreate

If all else fails:

1. Sign out completely
2. Clear browser cookies and local storage
3. Delete the user from both auth.users and public.Users tables in Supabase
4. Try signing in again with Google
5. Check database tables to verify correct data insertion

## 6. Need More Help?

If you continue experiencing issues:

1. Take screenshots of any error messages
2. Export the user data from both auth.users and public.Users tables (without sensitive data)
3. Document the steps to reproduce the issue
4. Contact the development team for assistance
