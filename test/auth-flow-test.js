// Authentication Flow Test Script
// Run this in the developer console to test the authentication system

import { supabase } from '../services/supabaseClient';

async function testAuth() {
  console.log('=== Auth Flow Test ===');
  console.log('1. Testing Supabase Environment Variables:');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log(`Supabase URL defined: ${!!supabaseUrl}`);
  console.log(`Supabase Anon Key defined: ${!!supabaseAnonKey}`);
  
  // Test current session
  console.log('\n2. Checking current session:');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Session error:', error);
    } else {
      console.log('Session exists:', !!data.session);
      if (data.session) {
        console.log('User email:', data.session.user.email);
      }
    }
  } catch (err) {
    console.error('Error checking session:', err);
  }
  
  // Test admin email list
  console.log('\n3. Testing admin email list:');
  try {
    const { ADMIN_EMAILS } = await import('../lib/admin');
    console.log('Admin emails:', ADMIN_EMAILS);
  } catch (err) {
    console.error('Error importing admin emails:', err);
  }
  
  // Test sign in process
  console.log('\n4. Testing sign in with test credentials:');
  const testEmail = 'coderjourney4590@gmail.com';
  try {
    // First sign out if already signed in
    await supabase.auth.signOut();
    console.log('Signed out any existing user');
    
    // Try signing in
    console.log(`Attempting to sign in with: ${testEmail}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'test123456' // Enter a password to test with
    });
    
    if (error) {
      console.error('Sign-in test failed:', error);
    } else {
      console.log('Sign-in test succeeded:', data);
    }
  } catch (err) {
    console.error('Error in sign-in test:', err);
  }
}

// Make the function available globally for running in console
window.testAuth = testAuth;

export default testAuth;
