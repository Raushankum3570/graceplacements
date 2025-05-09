'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/services/supabaseClient';

export default function AccountManager() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [action, setAction] = useState('create');
  
  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      if (action === 'create') {
        // Create user account
        await createUser();
      } else if (action === 'delete') {
        // Delete user account
        await deleteUser();
      } else if (action === 'check') {
        // Check user account
        await checkUser();
      }
    } finally {
      setLoading(false);
    }
  };
  
  const createUser = async () => {
    try {
      // Validate inputs
      if (!email || !password || !name) {
        setResult({
          success: false,
          message: 'All fields are required'
        });
        return;
      }
      
      if (password.length < 6) {
        setResult({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
        return;
      }
      
      // First step: Create user in auth system
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) {
        setResult({
          success: false,
          message: 'Failed to create auth account',
          error
        });
        return;
      }
      
      // Second step: Add user to database
      const { error: dbError } = await supabase
        .from('Users')
        .insert([
          {
            email: email.toLowerCase(),
            name,
            is_admin: false,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (dbError) {
        setResult({
          success: true,
          message: 'Auth account created, but failed to add to database',
          dbError
        });
        return;
      }
      
      // Test sign in
      try {
        // Sign out first if already signed in
        await supabase.auth.signOut();
        
        // Now try signing in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        
        if (signInError) {
          setResult({
            success: true,
            message: 'Account created but sign in failed - might need email verification',
            error: signInError,
            account: data
          });
        } else {
          setResult({
            success: true,
            message: 'Account created and sign in successful!',
            account: signInData
          });
        }
      } catch (signInErr) {
        setResult({
          success: true,
          message: 'Account created but sign in test failed',
          error: signInErr,
          account: data
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: 'Unexpected error occurred',
        error: err
      });
    }
  };
  
  const deleteUser = async () => {
    try {
      // First try to find the user in the database
      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (userError) {
        setResult({
          success: false,
          message: 'Could not find user in database',
          error: userError
        });
        return;
      }
      
      // Delete from database
      const { error: deleteError } = await supabase
        .from('Users')
        .delete()
        .eq('email', email.toLowerCase());
      
      if (deleteError) {
        setResult({
          success: false,
          message: 'Failed to delete user from database',
          error: deleteError
        });
        return;
      }
      
      // Note: Can't delete from auth without admin access
      setResult({
        success: true,
        message: 'User deleted from database. Note: User still exists in auth system.',
        userData
      });
    } catch (err) {
      setResult({
        success: false,
        message: 'Unexpected error occurred',
        error: err
      });
    }
  };
  
  const checkUser = async () => {
    try {
      // Check if user exists in database
      const { data: dbUser, error: dbError } = await supabase
        .from('Users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      // Try to sign in
      await supabase.auth.signOut();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });
      
      setResult({
        success: true,
        message: 'User check complete',
        databaseUser: dbError ? null : dbUser,
        databaseError: dbError,
        authUser: authError ? null : authData,
        authError,
        exists: {
          inDatabase: !dbError,
          inAuth: !authError
        }
      });
    } catch (err) {
      setResult({
        success: false,
        message: 'Unexpected error occurred',
        error: err
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Account Manager</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Manage User Accounts</h2>
        
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={action === 'create' ? 'default' : 'outline'}
              onClick={() => setAction('create')}
            >
              Create Account
            </Button>
            <Button
              variant={action === 'check' ? 'default' : 'outline'}
              onClick={() => setAction('check')}
            >
              Check Account
            </Button>
            <Button
              variant={action === 'delete' ? 'default' : 'outline'}
              onClick={() => setAction('delete')}
            >
              Delete Account
            </Button>
          </div>
          
          <form onSubmit={handleAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            
            {(action === 'create' || action === 'check') && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="text" // Text for visibility
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required={action === 'create' || action === 'check'}
                />
                {action === 'create' && (
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                )}
              </div>
            )}
            
            {action === 'create' && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required={action === 'create'}
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (
                action === 'create' ? 'Create Account' :
                action === 'check' ? 'Check Account' :
                'Delete Account'
              )}
            </Button>
          </form>
        </div>
      </Card>
      
      {result && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          
          <Alert
            className={result.success ? "bg-green-50 text-green-800 mb-4" : "bg-red-50 text-red-800 mb-4"}
          >
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
          
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </Card>
      )}
      
      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => window.location.href = '/auth'}>
          Return to Login Page
        </Button>
        <Button variant="outline" className="ml-2" onClick={() => window.location.href = '/new-auth'}>
          Try New Auth Page
        </Button>
      </div>
    </div>
  );
}
