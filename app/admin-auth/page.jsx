'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/services/supabaseClient';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

// List of authorized admin emails
const ADMIN_EMAILS = [
  '950321104040@gracecoe.org',
  'principal@gracecoe.org',
  'placement.officer@gracecoe.org',
  'dean@gracecoe.org',
  'tech.admin@gracecoe.org'
];

export default function AdminAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sign in with Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
      
      // The OAuth flow will handle redirection
      setSuccess("Redirecting to Google authentication...");
      
    } catch (err) {
      console.error('Error signing in with Google:', err);
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
          
          if (isAdminEmail) {
            // Update user metadata to mark as admin
            await supabase.auth.updateUser({
              data: { is_admin: true }
            });
            
            // Update in database table too
            await supabase
              .from('Users')
              .update({ is_admin: true })
              .eq('email', user.email.toLowerCase());
            
            setSuccess('Admin authentication successful! Redirecting...');
            // Redirect to admin page
            setTimeout(() => {
              window.location.href = '/admin';
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
          if (isAdmin) {
            setSuccess('Admin authentication successful! Redirecting...');
            setTimeout(() => {
              window.location.href = '/admin';
            }, 1000);
          } else {
            // Not an admin, sign out
            await supabase.auth.signOut();
            setError('Unauthorized access: Your email is not registered as an admin account.');
            setLoading(false);
          }
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
          />
          <h1 className="text-2xl font-bold mt-6">Admin Access</h1>
          <p className="text-gray-500 mt-2">
            Restricted area for authorized administrators only
          </p>
        </div>

        {error && (
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
              Sign in with your administrative Google account
            </p>
          </div>

          <Button
            onClick={signInWithGoogle}
            variant="outline"
            className="w-full flex items-center justify-center gap-3 h-12 text-base"
            disabled={loading}
          >
            <Image src="/Google.png" alt="Google" width={24} height={24} />
            Sign in with Google
          </Button>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Only authorized admin accounts can access this portal.</p>
            <p className="mt-2">Your Google email must be on the approved admin list.</p>
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