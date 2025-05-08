// List of admin email addresses
const ADMIN_EMAILS = [
  'admin@gracecoe.org',
  'principal@gracecoe.org',
  'placement.officer@gracecoe.org',
  'dean@gracecoe.org',
  'tech.admin@gracecoe.org'
];

/**
 * Check if a user is an admin based on their email
 * @param {Object} user - The user object from Supabase auth
 * @returns {Boolean} - True if the user is an admin
 */
export function isAdmin(user) {
  if (!user || !user.email) {
    return false;
  }
  
  // First check for the computed admin status we added in provider.jsx
  if (user.is_admin_computed !== undefined) {
    return !!user.is_admin_computed;
  }
  
  // Then check for database is_admin if it exists
  if (user.is_admin !== undefined) {
    return !!user.is_admin;
  }
  
  // Fallback to checking email directly
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/**
 * Custom hook to protect admin routes
 * @param {Object} router - Next.js router
 * @param {Object} user - User object
 * @param {Boolean} isLoading - Loading state
 * @returns {Boolean} - Whether the user is authorized
 */
export function useAdminProtection(router, user, isLoading) {
  // If still loading, don't do anything yet
  if (isLoading) {
    return false;
  }
  
  // If user is not logged in or not an admin, redirect to home
  if (!user || !isAdmin(user)) {
    // Use setTimeout to avoid React state updates during render
    setTimeout(() => {
      router.push('/');
    }, 100);
    return false;
  }
  
  return true;
}