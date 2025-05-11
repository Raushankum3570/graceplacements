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
        
        // Get picture from Google OAuth if available
        const authPicture = data.session.user.user_metadata?.avatar_url || 
                           data.session.user.user_metadata?.picture;
        
        // Get full name from Google OAuth if available
        const authFullName = data.session.user.user_metadata?.full_name || 
                            data.session.user.user_metadata?.name;
        
        // Combine auth metadata with database record
        return {
          user: {
            ...userData,
            // Ensure admin status is correct
            is_admin: finalAdminStatus,
            // Use picture from auth if available and no picture in DB
            picture: userData.picture || authPicture || null,
            // Use name from auth if available and no name in DB
            name: userData.name || authFullName || userData.email.split('@')[0],
            // Add auth metadata
            auth_metadata: data.session.user.user_metadata || {},
            auth_id: data.session.user.id,
            // Add provider info
            provider: userData.provider || data.session.user.app_metadata?.provider || null
          }
        };
      } else {        console.log('User not found in database, using auth data');
        
        // Extract Google OAuth profile data if available
        const authPicture = data.session.user.user_metadata?.avatar_url || 
                           data.session.user.user_metadata?.picture;
        const authFullName = data.session.user.user_metadata?.full_name || 
                            data.session.user.user_metadata?.name;
        const provider = data.session.user.app_metadata?.provider || null;
        
        // Create a user object from auth data
        return {
          user: {
            email: data.session.user.email,
            name: authFullName || data.session.user.email.split('@')[0],
            picture: authPicture || null,
            is_admin: isAdmin(data.session.user),
            auth_id: data.session.user.id,
            provider: provider,
            auth_metadata: data.session.user.user_metadata || {}
          }
        };
      }
    } catch (dbError) {
      console.error('Error fetching user from database:', dbError);      // Fallback to auth user data
      // Extract Google OAuth profile data if available
      const authPicture = data.session.user.user_metadata?.avatar_url || 
                         data.session.user.user_metadata?.picture;
      const authFullName = data.session.user.user_metadata?.full_name || 
                          data.session.user.user_metadata?.name;
      const provider = data.session.user.app_metadata?.provider || null;
      
      return {
        user: {
          email: data.session.user.email,
          name: authFullName || data.session.user.user_metadata?.name || data.session.user.email.split('@')[0],
          picture: authPicture || null,
          is_admin: isAdmin(data.session.user),
          auth_id: data.session.user.id,
          provider: provider,
          auth_metadata: data.session.user.user_metadata || {}
        }
      };
    }
  } catch (err) {
    console.error('Error in getSessionAndUser:', err);
    return { user: null };
  }
}
