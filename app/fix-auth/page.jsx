'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function FixAuthenticationPage() {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Authentication Troubleshooting</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Fix Sign In/Sign Up Issues</h2>
          <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            <span className="font-bold">Email logins are disabled error detected!</span> This means your Supabase project needs to be reconfigured.
          </AlertDescription>
        </Alert>
        
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            <span className="font-bold">Database error: relation 'public.Users' does not exist!</span> The Users table is missing in your Supabase database.
          </AlertDescription>
        </Alert>
        
        <Alert className="mb-6">
          <AlertDescription>
            Based on the error message "Email logins are disabled", you need to enable email authentication in your Supabase dashboard.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <h3 className="font-bold mb-2">Here's how to fix your authentication problems:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>First, fix the missing Users table issue with the database configuration tool</li>
              <li>Next, make sure email logins are enabled in Supabase</li>
              <li>Then, try creating a test user with the create user tool</li>
              <li>Finally, try signing in with the quick sign-in form</li>
            </ol>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/db-config">
              <Button className="w-full bg-red-600 hover:bg-red-700">Fix Missing Users Table</Button>
            </Link>
            
            <Link href="/auth-config">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Fix "Email logins are disabled"</Button>
            </Link>
            
            <Link href="/create-user">
              <Button className="w-full">Create Test User</Button>
            </Link>
            
            <Link href="/quick-signin">
              <Button className="w-full">Quick Sign-In</Button>
            </Link>
            
            <Link href="/auth-test">
              <Button className="w-full">Test Authentication</Button>
            </Link>
            
            <Link href="/env-check">
              <Button className="w-full">Check Environment</Button>
            </Link>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Common Authentication Issues</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-bold">1. Invalid Login Credentials</h3>
            <p className="text-gray-600">
              This occurs when either the email doesn't exist in the authentication system
              or the password is incorrect. You can verify this with the auth test tool.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold">2. Email Verification Required</h3>
            <p className="text-gray-600">
              By default, Supabase requires email verification. The account creation tool
              on this page will help you create an account that bypasses this requirement.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold">3. Missing Environment Variables</h3>
            <p className="text-gray-600">
              If your Supabase URL or API key are missing, authentication will fail.
              Use the Environment Check tool to verify these are correctly set up.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold">4. Database Connection Issues</h3>
            <p className="text-gray-600">
              If there's a problem connecting to the database, you might be able to authenticate
              but not store user profiles. The Auth Test tool will help diagnose this.
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/auth">
            <Button variant="outline">Return to Login Page</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
