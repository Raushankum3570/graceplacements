'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { supabase } from '@/services/supabaseClient';

export default function FixAuthenticationPage() {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  
  // Function to fix the auth_id column type issue
  const fixAuthIdColumnType = async () => {
    setLoading(true);
    setStatus('Fixing auth_id column type...');
    
    try {
      // First ensure the uuid-ossp extension is installed
      await supabase.rpc('execute_sql', {
        sql_query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
      });
      
      // Execute the first part - drop the column safely
      await supabase.rpc('execute_sql', {
        sql_query: `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE public."Users" DROP COLUMN auth_id;
              RAISE NOTICE 'Dropped existing auth_id column';
            EXCEPTION WHEN undefined_column THEN
              RAISE NOTICE 'auth_id column does not exist yet';
            END;
          END $$;
        `
      });
      
      // Execute the second part - create the column with correct type
      await supabase.rpc('execute_sql', {
        sql_query: `
          -- Add the column back with correct UUID type  
          ALTER TABLE public."Users" ADD COLUMN auth_id UUID;
          
          -- Make sure other columns exist too
          ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS provider TEXT;
          ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS picture TEXT;
        `
      });
      
      setStatus('✅ Fix successful! The auth_id column is now a UUID type.');
      
    } catch (err) {
      console.error('Error fixing auth_id column:', err);
      setError(err.message);
      setStatus('❌ Failed to fix auth_id column type. See error message below.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Authentication Troubleshooting</h1>
      
      {/* New Card for the auth_id column type issue */}
      <Card className="p-6 mb-6 border-2 border-yellow-300">
        <h2 className="text-2xl font-semibold mb-4">Fix Google Authentication UUID Error</h2>
          <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            <span className="font-bold">Error with Google Auth: &ldquo;invalid input syntax for type bigint/double precision: uuid-string&rdquo;</span>
          </AlertDescription>
        </Alert>
        
        <div className="mb-6">
          <p className="mb-2">This error occurs because the <code>auth_id</code> column in your Users table has the wrong data type:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your database has the column as <code>bigint</code> or <code>double precision</code> type</li>
            <li>Google authentication generates UUID strings like &ldquo;ae95fbd1-172e-4d17-af00-ee27c8ac11d4&rdquo;</li>
            <li>PostgreSQL can&apos;t convert the UUID string to a number automatically</li>
          </ul>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <Button 
            onClick={fixAuthIdColumnType}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {loading ? 'Fixing...' : 'Fix auth_id Column Type'}
          </Button>
          
          <Link href="/google-auth-debug">
            <Button variant="outline">
              Advanced Debugging
            </Button>
          </Link>
        </div>
        
        {status && (
          <div className={`mt-4 p-3 rounded-md ${
            status.includes('✅') ? 'bg-green-100 border border-green-200' : 
            status.includes('❌') ? 'bg-red-100 border border-red-200' :
            'bg-yellow-100 border border-yellow-200'
          }`}>
            <p>{status}</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-100 border border-red-200">
            <p className="font-bold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </Card>
      
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Fix Sign In/Sign Up Issues</h2>
          <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            <span className="font-bold">Email logins are disabled error detected!</span> This means your Supabase project needs to be reconfigured.
          </AlertDescription>
        </Alert>
        
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            <span className="font-bold">Database error: relation &apos;public.Users&apos; does not exist!</span> The Users table is missing in your Supabase database.
          </AlertDescription>
        </Alert>
        
        <Alert className="mb-6">
          <AlertDescription>
            Based on the error message &quot;Email logins are disabled&quot;, you need to enable email authentication in your Supabase dashboard.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <h3 className="font-bold mb-2">Here&apos;s how to fix your authentication problems:</h3>
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
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Fix &quot;Email logins are disabled&quot;</Button>
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
              This occurs when either the email doesn&apos;t exist in the authentication system
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
            <p className="text-gray-600">              If there&apos;s a problem connecting to the database, you might be able to authenticate
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
