// Create Test User Script for Authentication Testing
// Run this in the developer console to create a test user account

import { supabase } from '../services/supabaseClient';

async function createTestUser() {
  console.log('=== Creating Test User ===');
  
  // Test user credentials
  const testEmail = 'coderjourney4590@gmail.com';
  const testPassword = 'test123456';
  const testName = 'Test User';
  
  try {
    console.log(`Creating user with email: ${testEmail}`);
    
    // First check if user exists
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (existingUser?.user) {
      console.log('User already exists, proceeding to sign out');
      await supabase.auth.signOut();
      return;
    }
    
    // 1. First create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName
        }
      }
    });
    
    if (error) {
      console.error('Auth error:', error);
      return;
    }
    
    console.log('Auth sign-up success:', data);
    
    // 2. Store user in database table as well
    const { error: dbError } = await supabase
      .from('Users')
      .upsert([
        {
          email: testEmail.toLowerCase(),
          name: testName,
          is_admin: false,
          created_at: new Date().toISOString()
        }
      ], { onConflict: 'email' });
    
    if (dbError) {
      console.error('Database error:', dbError);
    } else {
      console.log('User added to database table successfully');
    }
    
    console.log('====================');
    console.log('Test user created successfully.');
    console.log('Email: coderjourney4590@gmail.com');
    console.log('Password: test123456');
    console.log('====================');
    
    // Sign out after creating
    await supabase.auth.signOut();
    
    return { success: true };
  } catch (err) {
    console.error('Error creating test user:', err);
    return { success: false, error: err };
  }
}

// Make available in browser console
window.createTestUser = createTestUser;

export default createTestUser;
