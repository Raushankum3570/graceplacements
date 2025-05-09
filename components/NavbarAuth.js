// Helper functions for authentication in Navbar
import { supabase } from '@/services/supabaseClient';
import { isAdmin, ADMIN_EMAILS } from '@/lib/admin';

/**
 * Gets user session and user data safely with error handling
 * @returns {Object} User session and data, or null
 */
export async function getSessionAndUser() {
  try {
    // First, get the session
    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('Session error:', sessionError);
      return { user: null };
    }
    
    // If no session or user, return null
    if (!data?.session?.user) {
      return { user: null };
    }
    
    // Try to fetch user data from database
    try {
      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('*')
        .eq('email', data.session.user.email)
        .single();
      
      if (userData && !userError) {
        console.log('Found user in database:', userData.email);
        
        // Verify admin status from both metadata and email list
        const isAdminUser = ADMIN_EMAILS.includes(userData.email?.toLowerCase());
        const isAdminInMetadata = data.session.user.user_metadata?.is_admin === true;
        const finalAdminStatus = isAdminUser || isAdminInMetadata || !!userData.is_admin;
        
        // Combine auth metadata with database record
        return {
          user: {
            ...userData,
            // Ensure admin status is correct
            is_admin: finalAdminStatus,
            // Add auth metadata if needed
            auth_metadata: data.session.user.user_metadata || {},
            auth_id: data.session.user.id
          }
        };
      } else {
        console.log('User not found in database, using auth data');
        // Create a user object from auth data
        return {
          user: {
            email: data.session.user.email,
            name: data.session.user.user_metadata?.name || data.session.user.email.split('@')[0],
            is_admin: isAdmin(data.session.user),
            auth_id: data.session.user.id
          }
        };
      }
    } catch (dbError) {
      console.error('Error fetching user from database:', dbError);
      // Fallback to auth user data
      return {
        user: {
          email: data.session.user.email,
          name: data.session.user.user_metadata?.name || data.session.user.email.split('@')[0],
          is_admin: isAdmin(data.session.user),
          auth_id: data.session.user.id
        }
      };
    }
  } catch (err) {
    console.error('Error in getSessionAndUser:', err);
    return { user: null };
  }
}
