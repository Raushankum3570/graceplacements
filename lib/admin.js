// Centralized list of admin email addresses and passwords
export const ADMIN_EMAILS = [
  'admin@gracecoe.org',
  'principal@gracecoe.org',
  'placement.officer@gracecoe.org',
  'dean@gracecoe.org',
  'tech.admin@gracecoe.org',
  '950321104040@gracecoe.org',
  '950321104020@gracecoe.org',
  'b@gmail.com'
];

// Admin email to password mapping
export const ADMIN_PASSWORDS = {
  'admin@gracecoe.org': 'Grace123456',
  'principal@gracecoe.org': 'Principal2025',
  'placement.officer@gracecoe.org': 'Placement2025',
  'dean@gracecoe.org': 'Dean2025',
  'tech.admin@gracecoe.org': 'TechAdmin2025',
  '950321104040@gracecoe.org': 'Student2025',
  '950321104020@gracecoe.org': 'Student2026',
  'b@gmail.com': 'Grace123456'
};

/**
 * Check if a user is an admin based on their email or metadata
 * @param {Object} user - The user object from Supabase auth
 * @returns {Boolean} - True if the user is an admin
 */
export function isAdmin(user) {
  if (!user || !user.email) {
    return false;
  }
  
  // First check for admin flag in user metadata
  if (user.user_metadata && user.user_metadata.is_admin === true) {
    return true;
  }
  
  // Then check for the computed admin status we added in provider.jsx
  if (user.is_admin_computed !== undefined) {
    return !!user.is_admin_computed;
  }
  
  // Then check for database is_admin if it exists
  if (user.is_admin !== undefined) {
    return !!user.is_admin;
  }
  
  // Fallback to checking email directly against our admin list
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

/**
 * Function to redirect users based on their authentication and admin status
 * @param {Object} router - Next.js router
 * @param {Object} user - User object from Supabase
 * @param {String} currentPath - Current path
 */
export function redirectBasedOnAuth(router, user, currentPath) {
  // Skip redirects for public pages
  if (currentPath === '/' || currentPath === '') {
    return;
  }

  // If on admin pages but not an admin, redirect to home
  if (currentPath.startsWith('/admin') && (!user || !isAdmin(user))) {
    console.log('Not authorized for admin area, redirecting');
    router.push('/admin-auth');
    return;
  }

  // If on auth pages but already authenticated, redirect appropriately
  if (currentPath === '/auth' && user) {
    // Admin users go to admin dashboard
    if (isAdmin(user)) {
      console.log('Admin user on auth page, redirecting to admin dashboard');
      router.push('/admin');
    } else {
      // Regular users go to home
      console.log('Regular user on auth page, redirecting to home');
      router.push('/');
    }
    return;
  }

  // If on admin-auth but already authenticated as admin, redirect to admin dashboard
  if (currentPath === '/admin-auth' && user && isAdmin(user)) {
    console.log('Admin already authenticated, redirecting to admin dashboard');
    router.push('/admin');
  }
}