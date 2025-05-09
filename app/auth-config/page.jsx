'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/services/supabaseClient';
import Link from 'next/link';

export default function AuthConfig() {
  const [loading, setLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState(null);
  const [isFixApplied, setIsFixApplied] = useState(false);

  // Check auth configuration on page load
  useEffect(() => {
    checkAuthConfig();
  }, []);

  // Function to check if email auth is enabled
  const checkAuthConfig = async () => {
    setLoading(true);
    
    try {
      // First, try to get the current session if any
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Try a simple operation to check auth provider settings
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: 'test@example.com',
        options: {
          // Just checking if the endpoint exists, not actually sending email
          shouldCreateUser: false,
        }
      });

      // Test if the error indicates disabled email auth
      const isEmailDisabled = 
        signInError && 
        (signInError.message.includes('Email logins are disabled') ||
        signInError.message.includes('Email auth is not enabled'));
      
      // Check what auth methods are available
      setAuthConfig({
        emailAuthEnabled: !isEmailDisabled,
        hasActiveSession: !!sessionData?.session,
        errorMessage: isEmailDisabled ? signInError.message : null,
      });
      
    } catch (error) {
      console.error('Error checking auth config:', error);
      setAuthConfig({
        emailAuthEnabled: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Supabase Authentication Configuration</h1>
      
      {loading ? (
        <div className="text-center p-8">
          <div className="spinner inline-block w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-2">Checking authentication configuration...</p>
        </div>
      ) : (
        <>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
            
            {authConfig?.emailAuthEnabled ? (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  ✅ Email authentication is properly configured and enabled!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  ⚠️ Email authentication is disabled: {authConfig?.errorMessage || "Unknown error"}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Current Authentication Status:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email Auth: {authConfig?.emailAuthEnabled ? 'Enabled' : 'Disabled'}</li>
                <li>Active Session: {authConfig?.hasActiveSession ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </Card>
          
          <Card className="p-6 mb-6 bg-blue-50">
            <h2 className="text-xl font-semibold mb-4">How to Fix</h2>
            
            <div className="space-y-4">
              <div className="ml-4">              <h3 className="font-semibold mb-2">Enable Email Authentication & Sign-ups in Supabase:</h3>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>
                    Log in to the Supabase Dashboard at{" "}
                    <a href="https://app.supabase.io" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      https://app.supabase.io
                    </a>
                  </li>
                  <li>Select your project</li>
                  <li>Navigate to "Authentication" → "Providers" in the left sidebar</li>
                  <li>Find "Email" under the list of providers</li>
                  <li>Make sure "Email" is enabled (toggle switch should be ON)</li>
                  <li>Enable "Email/Password Sign Up"</li>
                  <li>Navigate to "Authentication" → "URL Configuration"</li>
                  <li>Under "Site URL", make sure your domain is correctly set</li>
                  <li><strong className="text-red-600">Important:</strong> Go to "Authentication" → "Settings"</li>
                  <li>Under "User Sign-ups", make sure "Enable Sign-ups" is TURNED ON</li>
                  <li>Save all your changes</li>
                </ol>
              </div>
            </div>
            
            <Button 
              onClick={checkAuthConfig}
              className="mt-6"
            >
              Re-check Configuration
            </Button>
          </Card>
          
          <div className="flex space-x-2 justify-end">
            <Link href="/auth">
              <Button variant="outline">Go to Login Page</Button>
            </Link>
            <Link href="/new-auth">
              <Button variant="outline">Try New Auth Page</Button>
            </Link>
            <Link href="/fix-auth">
              <Button>Auth Debug Tools</Button>
            </Link>
          </div>
        </>
      )}
      
      <div className="mt-12 bg-gray-50 p-6 rounded-lg border text-sm">
        <h3 className="font-medium mb-2">Technical Details:</h3>
        <p className="mb-2">
          The error "Email logins are disabled" indicates that your Supabase project has email authentication turned off.
          This can be changed in your Supabase project settings.
        </p>
        <p>
          Once enabled, both email/password and magic link authentication will work properly.
        </p>
      </div>
    </div>
  );
}