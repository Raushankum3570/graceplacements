/**
 * Authentication Test Script
 * 
 * This script helps verify that the authentication system is working correctly.
 * You can run this in your browser console on different pages to check authentication states.
 */

async function testAuthSystem() {
  console.log('=== Testing Authentication System ===');
  
  // Test 1: Check current session
  console.log('Test 1: Checking current session...');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
  } else {
    console.log('Current session:', sessionData?.session ? 'Active' : 'None');
    
    if (sessionData?.session?.user) {
      console.log('User email:', sessionData.session.user.email);
      
      // Check admin status
      console.log('Checking admin status...');
      
      // Get admin emails from JS global variable if available
      let adminEmails = [];
      if (typeof ADMIN_EMAILS !== 'undefined') {
        adminEmails = ADMIN_EMAILS;
        console.log('Admin email list found:', adminEmails);
      }
      
      const isAdminEmail = adminEmails.includes(sessionData.session.user.email.toLowerCase());
      console.log('Is admin by email?', isAdminEmail);
      
      const isAdminMetadata = sessionData.session.user.user_metadata?.is_admin === true;
      console.log('Is admin by metadata?', isAdminMetadata);
      
      // Test 2: Try to fetch user data from database
      console.log('\nTest 2: Fetching user data from database...');
      try {
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('*')
          .eq('email', sessionData.session.user.email)
          .single();
          
        if (userError) {
          console.error('Error fetching user from database:', userError);
        } else {
          console.log('User data from database:', userData);
          console.log('Is admin in database?', userData?.is_admin);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    }
  }
  
  // Test 3: Test custom auth event
  console.log('\nTest 3: Testing auth update event...');
  const testEvent = new CustomEvent('supabase-auth-update', { 
    detail: { action: 'test', timestamp: new Date().getTime() } 
  });
  window.dispatchEvent(testEvent);
  console.log('Auth update event dispatched');
}

// Execute the tests
testAuthSystem().then(() => {
  console.log('=== Auth system testing completed ===');
});
