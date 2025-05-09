'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/services/supabaseClient';

export default function AuthDebugger() {
  const [email, setEmail] = useState('coderjourney4590@gmail.com');
  const [password, setPassword] = useState('test123456');
  const [operation, setOperation] = useState('signin');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [envStatus, setEnvStatus] = useState({});
  
  // Check environment variables on initial load
  useState(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setEnvStatus({
      url: supabaseUrl ? 'Defined' : 'Missing',
      key: supabaseKey ? 'Defined' : 'Missing'
    });
  }, []);
  
  // Test sign-in
  const testSignIn = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log(`Testing sign-in with: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      setResult({
        success: !error,
        data: data || {},
        error: error || null
      });
      
      if (error) {
        console.error('Sign-in error:', error);
      } else {
        console.log('Sign-in successful:', data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setResult({
        success: false,
        error: err
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Test sign-up
  const testSignUp = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log(`Testing sign-up with: ${email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      setResult({
        success: !error,
        data: data || {},
        error: error || null
      });
      
      if (error) {
        console.error('Sign-up error:', error);
      } else {
        console.log('Sign-up successful:', data);
        
        // Also try to add to Users table
        try {
          const { error: dbError } = await supabase
            .from('Users')
            .insert([
              { 
                email: email.toLowerCase(),
                name,
                created_at: new Date().toISOString()
              }
            ]);
          
          if (dbError) {
            console.error('Database error:', dbError);
            setResult(prev => ({ 
              ...prev, 
              dbError 
            }));
          } else {
            console.log('User added to database table');
          }
        } catch (dbErr) {
          console.error('Error adding user to database:', dbErr);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setResult({
        success: false,
        error: err
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Test checking session
  const checkSession = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      setResult({
        success: !error,
        data: data || {},
        error: error || null
      });
      
      if (error) {
        console.error('Session check error:', error);
      } else {
        console.log('Current session:', data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setResult({
        success: false,
        error: err
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out
  const testSignOut = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      setResult({
        success: !error,
        error: error || null
      });
      
      if (error) {
        console.error('Sign-out error:', error);
      } else {
        console.log('Successfully signed out');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setResult({
        success: false,
        error: err
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (operation === 'signin') {
      await testSignIn();
    } else if (operation === 'signup') {
      await testSignUp();
    } else if (operation === 'check') {
      await checkSession();
    } else if (operation === 'signout') {
      await testSignOut();
    }
  };
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Auth Debugger</h1>
      
      {/* Environment Status */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Supabase Environment</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</div>
          <div className={envStatus.url === 'Missing' ? 'text-red-600 font-bold' : 'text-green-600'}>
            {envStatus.url}
          </div>
          
          <div className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</div>
          <div className={envStatus.key === 'Missing' ? 'text-red-600 font-bold' : 'text-green-600'}>
            {envStatus.key}
          </div>
        </div>
      </Card>
      
      {/* Debugger Form */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Authentication</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Button
              type="button"
              variant={operation === 'signin' ? 'default' : 'outline'}
              onClick={() => setOperation('signin')}
            >
              Test Sign In
            </Button>
            
            <Button
              type="button"
              variant={operation === 'signup' ? 'default' : 'outline'}
              onClick={() => setOperation('signup')}
            >
              Test Sign Up
            </Button>
            
            <Button
              type="button"
              variant={operation === 'check' ? 'default' : 'outline'}
              onClick={() => setOperation('check')}
            >
              Check Session
            </Button>
            
            <Button
              type="button"
              variant={operation === 'signout' ? 'default' : 'outline'}
              onClick={() => setOperation('signout')}
            >
              Test Sign Out
            </Button>
          </div>
          
          <div className="space-y-4">
            {operation === 'signup' && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Test User"
                />
              </div>
            )}
            
            {(operation === 'signin' || operation === 'signup') && (
              <>
                <div>
                  <Label htmlFor="debug-email">Email</Label>
                  <Input
                    id="debug-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="debug-password">Password</Label>
                  <Input
                    id="debug-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters
                  </p>
                </div>
              </>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : 'Run Test'}
            </Button>
          </div>
        </form>
      </Card>
      
      {/* Results */}
      {result && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            <AlertDescription>
              {result.success 
                ? 'Operation completed successfully!' 
                : 'Operation failed. See details below.'}
            </AlertDescription>
          </Alert>
          
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </Card>
      )}
      
      {/* Help Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting Instructions:</h2>        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>First, check that the environment variables are properly defined and display as &quot;Defined&quot;</li>
          <li>Test &quot;Check Session&quot; to see if you&apos;re currently authenticated</li>
          <li>If needed, &quot;Test Sign Out&quot; to clear any existing sessions</li>
          <li>Test &quot;Sign Up&quot; with your email to create a new account</li>
          <li>After signing up, try &quot;Sign In&quot; with the same credentials</li>
          <li>Look at the JSON response for specific error messages</li>
          <li>Common issues:
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Email verification required</li>
              <li>Incorrect password</li>
              <li>Account does not exist</li>
              <li>Password too short (min 6 characters)</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}
