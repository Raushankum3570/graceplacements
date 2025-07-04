"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/services/supabaseClient'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import GoogleButton from '@/components/GoogleButton'

function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState("signin")  
  const [unverifiedEmail, setUnverifiedEmail] = useState(null)
  
  // Check for query parameters like reset=success when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const resetStatus = urlParams.get('reset');
      
      if (resetStatus === 'success') {
        setSuccess('Your password has been reset successfully. You can now sign in with your new password.');
      }
    }
  }, []);
  
  // We're using email-based authentication only
  const signInWithEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUnverifiedEmail(null)
    
    try {
      console.log('Attempting to sign in with:', email);
      
      // Validate input first
      if (!email.trim() || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }
        // Try to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      // Handle specific error cases
      if (error) {
        console.error('Sign-in error:', error);
        
        if (error.message.includes('Invalid login credentials')) {          // Check if user exists but password is wrong
          const { data: checkData, error: checkError } = await supabase.auth.resetPasswordForEmail(
            email.trim(),
            { redirectTo: null } // Just checking if the email exists, not actually sending reset email
          );
          
          if (!checkError) {
            setError('The password you entered is incorrect. Please try again or use the forgot password link.');
          } else {
            setError('No account found with this email. Please sign up first.');
            // Suggest switching to sign up tab
            setTimeout(() => {
              switchToSignUp();
            }, 2000);
          }
          return;        } else if (error.message.includes('Email not confirmed')) {
          setUnverifiedEmail(email);
          setError('Your email has not been confirmed. Please check your inbox or click the button below to resend the confirmation email.');
          return;
        } else {
          setError(error.message);
          return;
        }
      }
        // Successfully signed in
      console.log('Successfully authenticated, redirecting to homepage...');
      console.log('Sign in successful! User:', data.user);
    
      // Dispatch auth event for other components to sync
      if (typeof window !== 'undefined') {
        const authEvent = new CustomEvent('supabase-auth-update', {
          detail: { 
            action: 'signed_in', 
            source: 'auth_page',
            user: data.user,
            timestamp: new Date().getTime()
          }
        });
        window.dispatchEvent(authEvent);
        console.log('Auth event dispatched from auth page');
      }
      
      // Check if user might be an admin
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('gracecoe.org')) {
        console.log('Admin user detected, redirecting to admin dashboard');
        router.push('/admin');
      } else {        // Redirect regular user to home page
        console.log('Redirecting to homepage');
        router.push('/');
      }
      
    } catch (err) {
      console.error('Error in sign-in process:', err);
      setError(err.message || 'An error occurred during sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const resendVerificationEmail = async () => {
    if (!unverifiedEmail) return;
    
    setResendLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unverifiedEmail
      });
      if (error) throw error;      setSuccess(`Verification email resent to ${unverifiedEmail}. Please check your inbox.`);
    } catch (err) {
      console.error('Error resending verification email:', err)
      setError(err.message)    } finally {
      setResendLoading(false)
    }
  };
    const handleForgotPassword = async () => {
    // Make sure we have an email
    if (!email || email.trim() === '') {
      setError('Please enter your email address first');
      return;
    }
    
    setForgotPasswordLoading(true);
    setError(null);
    setSuccess(null);
      try {
      // Get site URL for redirects - this is crucial for making sure it works on Vercel
      let redirectUrl;
      if (typeof window !== 'undefined') {
        // Get the current origin (works for both localhost and deployed environments)
        const origin = window.location.origin;
        
        // Use the actual current origin for better reliability
        // This ensures it works on any deployment URL including preview deployments
        redirectUrl = `${origin}/reset-password`;
        
        console.log('Password reset redirect URL:', redirectUrl);
      } else {
        // Fallback if running on server
        redirectUrl = 'https://grace-placement.vercel.app/reset-password';
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });
      
      if (error) throw error;
      
      setSuccess(`Password reset email sent to ${email}. Please check your inbox.`);
    } catch (err) {
      console.error('Error sending password reset email:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };
  
  const signUpWithEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }
      
      console.log('Attempting to sign up with:', email)
        // Check if user might be an admin (for future reference)
      const isAdminEmail = email.toLowerCase().includes('admin') || 
                          email.toLowerCase().includes('gracecoe.org');
      
      // Use signUp with auto-confirmation enabled
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {          data: {
            name,
            is_admin: isAdminEmail // Set admin flag based on email domain
          },          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://grace-placement.vercel.app'
        }      });
      
      if (error) {
        console.error('Sign-up error:', error);
        setError(error.message);
        setLoading(false);
        return;
      }
      
      // Store user in database if sign-up was successful
      if (data?.user) {
        // We already have the isAdminEmail from earlier, reuse it
        console.log('Creating user record in database')
        
        const { error: dbError } = await supabase
          .from('Users')
          .insert([
            {
              email: email.toLowerCase(),
              name,
              is_admin: isAdminEmail, // Set admin flag based on email domain
              created_at: new Date().toISOString()
            }          ]);
        
        if (dbError) {
          console.error('Error storing user data:', dbError);
        }
        
        // Try auto sign-in after successful registration
        try {
          console.log('Attempting automatic sign-in after registration')
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password          });
          
          if (signInError) {
            console.error('Auto sign-in error:', signInError);
            setSuccess('Registration successful! You can now sign in with your credentials.');
          } else {
            console.log('Auto sign-in successful, redirecting...');
            
            // Dispatch auth event for other components to sync
            if (typeof window !== 'undefined') {
              const authEvent = new CustomEvent('supabase-auth-update', {
                detail: { 
                  action: 'signed_in', 
                  source: 'auth_page',
                  user: signInData.user,
                  timestamp: new Date().getTime()
                }
              });
              window.dispatchEvent(authEvent);
            }
            
            // Redirect based on user type
            if (isAdminEmail) {
              router.push('/admin');
            } else {
              router.push('/');
            }
            return;
          }        } catch (autoSignInErr) {
          console.error('Error in auto sign-in:', autoSignInErr);
        }
      }
      
      setSuccess('Registration successful! You can now sign in with your credentials.');
      
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccess("Connecting to Google...");
    
    try {
      console.log('Auth: Starting Google sign-in process');
      
      // Get site URL for proper redirects
      let redirectUrl;
      if (typeof window !== 'undefined') {
        redirectUrl = window.location.origin;
      } else {
        // Fallback for server-side rendering
        redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://grace-placement.vercel.app';
      }
      
      console.log('Auth: Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}/`,  // Redirect to home page after authentication
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('Auth: Google OAuth error:', error);
        throw error;
      }
      
      // If we get here without an error, the user is being redirected to Google
      console.log('Auth: Redirecting to Google OAuth...', data);
      setSuccess("Redirecting to Google...");
      
      // No need to handle success case - the user will be redirected away
      
    } catch (err) {
      console.error('Auth: Google sign-in error:', err);
      setError(err.message || 'Failed to connect to Google. Please try again.');
      setSuccess(null);
      setGoogleLoading(false);
    } finally {
      // Google OAuth redirects the user, so we won't reach this code unless there was an error
      // that prevented the redirect
    }
  };
  
  // Function to handle user data after successful OAuth login
  const handleUserAfterOAuth = async (user) => {
    // Check if this is a new user (first Google login)
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('email', user.email)
      .single();
    
    if (error || !data) {
      // New user, create a record in the Users table
      const isAdminEmail = user.email.toLowerCase().includes('admin') || 
                          user.email.toLowerCase().includes('gracecoe.org');
      
      const { error: insertError } = await supabase
        .from('Users')
        .insert([{
          email: user.email.toLowerCase(),
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          is_admin: isAdminEmail,
          created_at: new Date().toISOString()
        }]);
      
      if (insertError) {
        console.error('Error storing Google user data:', insertError);
      }
    }
    
    // Redirect based on user type
    if (user.email.toLowerCase().includes('admin') || 
        user.email.toLowerCase().includes('gracecoe.org')) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };
  
  // Effect to handle OAuth redirects
  useEffect(() => {
    const handleAuthStateChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.provider_token && session?.provider_refresh_token) {
        // This is an OAuth session (e.g., Google)
        const user = session.user;
        console.log('OAuth session detected:', user.provider);
        
        // Process user data and redirect
        await handleUserAfterOAuth(user);
      }
    };
    
    // Check for OAuth session on mount
    handleAuthStateChange();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.provider_token) {
          // User just signed in with OAuth
          await handleUserAfterOAuth(session.user);
        }
      }
    );
      // Cleanup
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router, handleUserAfterOAuth]);

  const switchToSignUp = () => {
    setActiveTab("signup");
    setError(null);
    setSuccess(null)
    setUnverifiedEmail(null)
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <div className='hidden lg:flex flex-1 bg-blue-50 items-center justify-center'>
        <div className='max-w-lg p-8'>
          <Image 
            src='/ai.jpeg' 
            alt='login' 
            width={600} 
            height={400}
            className='rounded-xl shadow-lg'
          />
          <h2 className='text-3xl font-bold mt-8 text-blue-900'>Shape Your Future Career</h2>
          <p className='mt-4 text-gray-600 text-lg'>
            Grace Placement Management System helps you connect with leading companies
            and manage your entire placement journey in one place.
          </p>
        </div>
      </div>
      
      <div className='flex-1 flex flex-col items-center justify-center p-4 sm:p-8'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-8'>
            <Image src='/logo.svg' alt='logo' width={180} height={60} className='mx-auto' />
            <h2 className='text-2xl font-bold mt-6'>Welcome to Grace PMS</h2>
            <p className='text-gray-500 mt-2'>Your gateway to career opportunities</p>
          </div>          <div className="text-center mb-4">
            <p className="text-sm text-blue-600 font-medium mb-1">All users can sign in here</p>
            <a 
              href="/admin-auth" 
              className="text-blue-600 hover:underline text-xs"
            >
              Administrator? You can also login to the admin panel here
            </a>
          </div>

          {error && (
            <Alert variant="destructive" className='mb-6'>
              <AlertDescription>
                {error}
                {unverifiedEmail && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resendVerificationEmail}
                      disabled={resendLoading}
                    >
                      {resendLoading ? 'Sending...' : 'Resend verification email'}
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className='mb-6 bg-green-50 text-green-800 border-green-200'>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Card className='p-6'>
            <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={signInWithEmail} className='space-y-4'>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />                    <div className="text-right text-sm mt-1">                      <button 
                        type="button" 
                        onClick={() => handleForgotPassword()} 
                        disabled={forgotPasswordLoading}
                        className="text-blue-600 hover:underline">
                          {forgotPasswordLoading ? 'Sending reset email...' : 'Forgot password?'}
                      </button>
                    </div>
                  </div>                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || googleLoading}
                  >
                    {loading ? 'Signing in...' : 'Sign In with Email'}
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <GoogleButton 
                    onClick={signInWithGoogle} 
                    loading={googleLoading} 
                  />
                  
                  <p className="text-sm text-center text-gray-500 mt-4">
                    Don&apos;t have an account?{" "}
                    <button 
                      type="button"
                      onClick={switchToSignUp} 
                      className="text-blue-600 hover:underline"
                    >
                      Create one now
                    </button>
                  </p>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={signUpWithEmail} className='space-y-4'>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || googleLoading}
                  >
                    {loading ? 'Creating account...' : 'Create Account with Email'}
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <GoogleButton 
                    onClick={signInWithGoogle} 
                    loading={googleLoading} 
                  />
                </form>
              </TabsContent>
            </Tabs>            {/* Email-based authentication only */}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login