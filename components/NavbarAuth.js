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
    console.log('NavbarAuth: Fetching session data');
    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('NavbarAuth: Session error:', sessionError);
      return { user: null };
    }
    
    // If no session or user, return null
    if (!data?.session?.user) {
      console.log('NavbarAuth: No session or user found');
      return { user: null };
    }
    
    console.log('NavbarAuth: Session found with email:', data.session.user.email);
    console.log('NavbarAuth: Auth metadata:', data.session.user.app_metadata);
    console.log('NavbarAuth: User metadata:', data.session.user.user_metadata);
    
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
                            data.session.user.user_metadata?.name;          // Combine auth metadata with database record
        const userResult = {
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
          provider: userData.provider || data.session.user.app_metadata?.provider || null,
          // Always ensure email is available
          email: userData.email || data.session.user.email
        };
        
        console.log('NavbarAuth: Returning combined user data:', 
          JSON.stringify({
            email: userResult.email,
            name: userResult.name,
            has_picture: !!userResult.picture,
            is_admin: userResult.is_admin,
            provider: userResult.provider
          })
        );
        
        return { user: userResult };      } else {
        console.log('NavbarAuth: User not found in database, using auth data');
        
        // Extract Google OAuth profile data if available
        const authPicture = data.session.user.user_metadata?.avatar_url || 
                           data.session.user.user_metadata?.picture;
        const authFullName = data.session.user.user_metadata?.full_name || 
                            data.session.user.user_metadata?.name;
        const provider = data.session.user.app_metadata?.provider || null;
        
        // Create a user object from auth data
        const userResult = {
          email: data.session.user.email,
          name: authFullName || data.session.user.email.split('@')[0],
          picture: authPicture || null,
          is_admin: isAdmin(data.session.user),
          auth_id: data.session.user.id,
          provider: provider,
          auth_metadata: data.session.user.user_metadata || {}
        };
        
        console.log('NavbarAuth: Created new user from auth data:', 
          JSON.stringify({
            email: userResult.email,
            name: userResult.name,
            has_picture: !!userResult.picture,
            is_admin: userResult.is_admin,
            provider: userResult.provider
          })
        );
        
        // Create the user in the database for future use
        try {
          const { error: insertError } = await supabase
            .from('Users')
            .upsert({
              email: userResult.email,
              name: userResult.name,
              picture: userResult.picture,
              provider: userResult.provider,
              is_admin: userResult.is_admin,
              created_at: new Date().toISOString(),
              last_sign_in: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('NavbarAuth: Error creating user record:', insertError);
          } else {
            console.log('NavbarAuth: Created user record in database');
          }
        } catch (insertErr) {
          console.error('NavbarAuth: Exception creating user record:', insertErr);
        }
        
        return { user: userResult };
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
    }  } catch (err) {
    console.error('NavbarAuth: Error in getSessionAndUser:', err);
    
    // Try to salvage what user data we can from the session
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.email) {
        console.log('NavbarAuth: Salvaging user data from session after error');
        
        return {
          user: {
            email: data.session.user.email,
            name: data.session.user.user_metadata?.name || 
                  data.session.user.user_metadata?.full_name || 
                  data.session.user.email.split('@')[0],
            picture: data.session.user.user_metadata?.avatar_url || 
                     data.session.user.user_metadata?.picture,
            provider: data.session.user.app_metadata?.provider || null,
            is_admin: ADMIN_EMAILS.includes(data.session.user.email.toLowerCase())
          }
        };
      }
    } catch (fallbackError) {
      console.error('NavbarAuth: Even fallback error handling failed:', fallbackError);
    }
    
    return { user: null };
  }
}
