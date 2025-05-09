'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SimpleAuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to sign in with:', email);
      
      // Validate inputs
      if (!email.trim() || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }
      
      // Try sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      
      if (error) {
        console.error('Sign-in error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again or create an account.');
        } else {
          setError(error.message);
        }
        return;
      }
      
      console.log('Sign in successful!', data);
      setSuccess('Authentication successful! Redirecting...');
      
      // Dispatch auth event for other components
      if (typeof window !== 'undefined') {
        const authEvent = new CustomEvent('supabase-auth-update', {
          detail: { 
            action: 'signed_in',
            user: data.user,
            timestamp: new Date().getTime()
          }
        });
        window.dispatchEvent(authEvent);
      }
      
      // Redirect based on user type
      const isAdmin = email.toLowerCase().includes('admin') || 
                     email.toLowerCase().includes('gracecoe.org');
      
      setTimeout(() => {
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error in sign-in process:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to sign up with:', email);
      
      // Validate inputs
      if (!email.trim() || !password || !name.trim()) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }
      
      // Check if user might be an admin
      const isAdminEmail = email.toLowerCase().includes('admin') || 
                          email.toLowerCase().includes('gracecoe.org');
      
      // Create user in auth system - WITHOUT email verification
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name,
            is_admin: isAdminEmail
          }
        }
      });
      
      if (error) {
        console.error('Sign-up error:', error);
        setError(error.message);
        return;
      }
      
      console.log('Sign up successful!', data);
      
      // Store user in database table
      try {
        const { error: dbError } = await supabase
          .from('Users')
          .insert([
            {
              email: email.toLowerCase(),
              name,
              is_admin: isAdminEmail,
              created_at: new Date().toISOString()
            }
          ]);
        
        if (dbError) {
          console.error('Error storing user data:', dbError);
        }
      } catch (dbErr) {
        console.error('Database error:', dbErr);
      }
      
      // Immediately try to sign in
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        
        if (signInError) {
          console.error('Auto sign-in error:', signInError);
          setSuccess('Account created! Please sign in with your new credentials.');
          setTimeout(() => {
            setIsSignUp(false);
            setError(null);
          }, 1500);
        } else {
          console.log('Auto sign-in successful!');
          setSuccess('Account created and signed in! Redirecting...');
          
          // Dispatch auth event
          if (typeof window !== 'undefined') {
            const authEvent = new CustomEvent('supabase-auth-update', {
              detail: { 
                action: 'signed_in',
                user: signInData.user,
                timestamp: new Date().getTime()
              }
            });
            window.dispatchEvent(authEvent);
          }
          
          // Redirect based on user type
          setTimeout(() => {
            if (isAdminEmail) {
              router.push('/admin');
            } else {
              router.push('/');
            }
          }, 1500);
        }
      } catch (signInErr) {
        console.error('Error during auto sign-in:', signInErr);
        setSuccess('Account created! Please sign in with your new credentials.');
      }
      
    } catch (err) {
      console.error('Error in sign-up process:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.svg" alt="logo" width={180} height={60} className="mx-auto" />
          <h2 className="text-2xl font-bold mt-6">Welcome to Grace PMS</h2>
          <p className="text-gray-500 mt-2">Your gateway to career opportunities</p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <Card className="p-6">
          <div className="flex justify-center mb-6">
            <div className="flex border rounded-md overflow-hidden w-full">
              <button
                className={`flex-1 py-2 px-4 text-center font-medium ${
                  !isSignUp ? "bg-blue-600 text-white" : "bg-transparent text-gray-700"
                }`}
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center font-medium ${
                  isSignUp ? "bg-blue-600 text-white" : "bg-transparent text-gray-700"
                }`}
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
          
          {!isSignUp ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-sm text-center text-gray-500 mt-2">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-600 hover:underline"
                >
                  Create one now
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
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
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              <p className="text-sm text-center text-gray-500 mt-2">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-600 hover:underline"
                >
                  Sign in instead
                </button>
              </p>
            </form>
          )}
        </Card>
        
        <div className="text-center mt-4">
          <a href="/admin-auth" className="text-blue-600 hover:underline text-sm">
            Administrator? You can also login to the admin panel here
          </a>
        </div>
      </div>
    </div>
  );
}
