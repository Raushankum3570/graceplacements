'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/services/supabaseClient';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAILS, ADMIN_PASSWORDS } from '@/lib/admin';
import GoogleButton from '@/components/GoogleButton';
import { Separator } from '@/components/ui/separator';

export default function AdminAuth() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
    // Handle admin sign in with Google
  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccess("Connecting to Google...");
    
    try {
      console.log('AdminAuth: Starting Google sign-in process');
      
      // Get site URL for proper redirects
      let redirectUrl;
      if (typeof window !== 'undefined') {
        redirectUrl = window.location.origin;
      } else {
        // Fallback for server-side rendering
        redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://grace-placement.vercel.app';
      }
      
      console.log('AdminAuth: Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}/`, // Redirect to home page after authentication
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('AdminAuth: Google OAuth error:', error);
        throw error;
      }
      
      // If we get here without an error, the user is being redirected to Google
      console.log('AdminAuth: Redirecting to Google OAuth...', data);
      setSuccess("Redirecting to Google...");
        } catch (err) {
      console.error('AdminAuth: Google sign-in error:', err);
      setError(err.message || 'Failed to connect to Google. Please try again.');
      setSuccess(null);
      setGoogleLoading(false);
    } finally {
      // Google OAuth redirects the user, so we won't reach this code unless there was an error
      // that prevented the redirect. In that case, we ensure googleLoading is reset.
      setGoogleLoading(false);
    }
  };

  // Handle admin sign in with email/password
  const signInWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Check if email is in the admin list
      const lowerEmail = email.toLowerCase().trim();
      const isAdminEmail = ADMIN_EMAILS.includes(lowerEmail) || 
                           lowerEmail.includes('admin') ||
                           lowerEmail.includes('gracecoe.org');
      
      if (isAdminEmail) {
        // Check if this is a known admin with a specific password
        const hasSpecificPassword = Object.keys(ADMIN_PASSWORDS).includes(lowerEmail);
        
        if (hasSpecificPassword) {
          // Verify the specific admin password
          if (password === ADMIN_PASSWORDS[lowerEmail]) {
            // Password match - proceed with authentication
            setSuccess("Authentication successful! Redirecting...");
              try {
              // First try to sign in with the credentials
              let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: lowerEmail,
                password
              });
              
              // If sign-in fails, we need a different approach
              if (signInError) {
                console.log('Sign-in error:', signInError.message);
                
                if (signInError.message.includes("Invalid login credentials")) {
                  // Try to get the admin access token to check if user exists
                  const { data: authData } = await supabase.auth.getSession();
                  
                  // Try to sign up the user with this password
                  try {
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                      email: lowerEmail,
                      password,
                      options: { 
                        data: { is_admin: true },
                        emailRedirectTo: window.location.origin + '/'
                      }
                    });
                    
                    if (signUpError) {
                      if (signUpError.message.includes("User already registered")) {
                        setError("This admin email already exists with a different password. Please contact system administrator to reset your password.");
                        setLoading(false);
                        return;
                      } else {
                        setError(`Registration error: ${signUpError.message}`);
                        setLoading(false);
                        return;
                      }
                    } else {
                      // User was created, but requires email verification
                      setSuccess("Admin account created! Please check your email to verify your account before logging in.");
                      setLoading(false);
                      return;
                    }
                  } catch (err) {
                    setError(`Authentication error: ${err.message}`);
                    setLoading(false);
                    return;
                  }
                } else {
                  // Some other error during sign-in
                  setError(`Authentication error: ${signInError.message}`);
                  setLoading(false);
                  return;
                }
              } else {
                // Sign-in successful
                // Update user metadata to mark as admin
                await supabase.auth.updateUser({
                  data: { is_admin: true }
                });
              }
              
              // Update or create the user record in the Users table
              await supabase
                .from('Users')
                .upsert(
                  { 
                    email: lowerEmail,
                    is_admin: true,
                    updated_at: new Date().toISOString()
                  },
                  { onConflict: 'email' }
                );                  // Redirect to home page
              window.location.href = '/';
              return; // Exit early as we've handled everything
            } catch (specialAuthErr) {
              console.error('Error in admin auth flow:', specialAuthErr);
              setError(specialAuthErr.message || "An authentication error occurred");
              setLoading(false);
              return;
            }
          } else {
            // Password doesn't match for this admin
            throw new Error(`Incorrect password for ${lowerEmail}. Please try again.`);
          }
        } else {
          // Admin without specific password - check minimum length
          if (password.length < 4) {
            throw new Error('Password must be at least 4 characters long.');
          }
          
          // Proceed with normal authentication
          const { data, error } = await supabase.auth.signInWithPassword({
            email: lowerEmail,
            password
          });
          
          if (error) {
            console.error('Admin sign-in error:', error);
            
            if (error.message.includes('Invalid login credentials')) {
              // Try to check if the user exists first
              const { data: checkData, error: checkError } = await supabase.auth.resetPasswordForEmail(
                lowerEmail,
                { redirectTo: null } // Just check if email exists, don't actually send reset email
              );
              
              if (!checkError) {
                // User exists but password is wrong
                throw new Error('The password you entered is incorrect. Please try again.');
              } else {
                // User doesn't exist
                throw new Error('No admin account found with this email. Please contact system administrator.');
              }
            } else {
              throw error;
            }
          }
          
          // Authentication successful - the onAuthStateChange listener will handle redirect
          setSuccess("Authentication successful! Redirecting...");
        }
      } else {
        // Not an admin email
        throw new Error('This email is not registered as an admin account.');
      }
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  // Handle auth state changes
  useEffect(() => {
    const handleAuthCheck = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        
        if (authData?.session?.user) {
          const user = authData.session.user;
          
          // Check if this is an admin email
          const isAdminEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase());
          const isGoogleLogin = user.app_metadata?.provider === 'google';
          
          // Check if this is a Google login from an admin email
          if (isAdminEmail) {
            // Update user metadata to mark as admin
            await supabase.auth.updateUser({
              data: { is_admin: true }
            });
            
            // Update in database table too
            await supabase
              .from('Users')
              .upsert(
                {
                  email: user.email.toLowerCase(),
                  name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
                  picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                  provider: user.app_metadata?.provider || 'email',
                  is_admin: true,
                  last_sign_in: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                { onConflict: 'email' }
              );
              setSuccess('Admin authentication successful! Redirecting...');
            // Redirect to home page
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else if (user.email) {
            // Not an admin email, sign them out
            await supabase.auth.signOut();
            setError('Unauthorized access: Your email is not registered as an admin account.');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setError('An error occurred while checking authentication status.');
        setLoading(false);
      }
    };
      // Call the auth check function immediately
    handleAuthCheck();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if admin email
          const isAdmin = ADMIN_EMAILS.includes(session.user.email?.toLowerCase());
          const isGoogleLogin = session.user.app_metadata?.provider === 'google';
          
          if (isAdmin) {
            // This is an admin account
            console.log('Admin signed in successfully', isGoogleLogin ? 'using Google' : 'using email');
            
            // Update user metadata to mark as admin
            await supabase.auth.updateUser({
              data: { is_admin: true }
            });
            
            // Mark this user as an admin in the database with complete profile
            try {
              await supabase
                .from('Users')
                .upsert(
                  { 
                    email: session.user.email.toLowerCase(),
                    name: session.user.user_metadata?.full_name || 
                          session.user.user_metadata?.name ||
                          session.user.email.split('@')[0],
                    picture: session.user.user_metadata?.avatar_url || 
                             session.user.user_metadata?.picture,
                    provider: session.user.app_metadata?.provider || 'email',
                    is_admin: true,
                    last_sign_in: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  },
                  { onConflict: 'email' }
                );
                
              console.log('Admin user profile updated');
            } catch (err) {
              console.error('Error updating admin status in database', err);
            }
              setSuccess('Admin authentication successful! Redirecting...');
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else {
            // Not an admin, sign out and redirect
            await supabase.auth.signOut();
            setError('Unauthorized access: Your email is not registered as an admin account.');
            setLoading(false);
            setGoogleLoading(false);
              // Redirect to home page
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        } else if (event === 'SIGNED_OUT') {
          setLoading(false);
          setGoogleLoading(false);
        }
      }
    );
    
    return () => {
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Image 
            src="/logo.svg" 
            alt="Grace Placement Management System" 
            width={180} 
            height={60} 
            className="mx-auto"
          />          <h1 className="text-2xl font-bold mt-6">Admin Access</h1>
          <p className="text-gray-500 mt-2">
            Sign in to access administrator features
          </p>
        </div>        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              <div className="font-bold">Access Denied</div>
              <div>{error}</div>
            </AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <Card className="p-8 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">Admin Sign In</h2>
            <p className="text-gray-600 mt-2">
              Sign in with your administrator credentials
            </p>          </div>

          <div className="relative my-4">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
              Admin Sign In Options
            </span>
          </div>

          <form onSubmit={signInWithEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@organization.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In as Administrator'}
            </Button>
          </form>          <Separator className="my-6" />
            <div className="flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-2">Admin emails can also sign in with:</p>
            <GoogleButton 
              onClick={signInWithGoogle}
              loading={googleLoading}
              className="w-full"
            />
          </div>            <div className="mt-6 text-center text-sm text-gray-600">
            <p>Only authorized admin accounts can access admin features.</p>
            <p className="mt-2">Your email must be on the approved administrator list.</p>
            <p className="mt-2 text-blue-600 font-medium">After signing in, you'll be redirected to the home page</p>
          </div>
        </Card>
        
        <div className="mt-4 text-center">
          <a 
            href="/auth" 
            className="text-blue-600 hover:underline text-sm"
          >
            Regular user? Sign in here
          </a>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is a secure area. Unauthorized access attempts are logged and monitored.</p>
        </div>
      </div>
    </div>
  );
}