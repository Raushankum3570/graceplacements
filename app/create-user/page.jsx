'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/services/supabaseClient';

export default function DirectUserCreator() {
  const [email, setEmail] = useState('coderjourney4590@gmail.com');
  const [password, setPassword] = useState('test123456');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const createUser = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Step 1: Check if user already exists in auth
      const { data: checkData, error: checkError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (!checkError) {
        // User exists and password is correct
        setResult({
          success: true,
          message: "User already exists and password is correct. You can use these credentials to sign in.",
          data: checkData
        });
        setLoading(false);
        return;
      }
      
      // Step 2: Create user with signUp
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name }
        }
      });
      
      if (signUpError) {
        setResult({
          success: false,
          message: "Failed to create user in authentication system",
          error: signUpError
        });
        setLoading(false);
        return;
      }
      
      // Step 3: Add user to database
      const { error: dbError } = await supabase
        .from('Users')
        .upsert([
          {
            email: email.toLowerCase(),
            name,
            created_at: new Date().toISOString()
          }
        ], { onConflict: 'email' });
      
      // Step 4: Done! Provide info to user
      setResult({
        success: true,
        message: "User created successfully! You can now sign in with these credentials.",
        authData: signUpData,
        dbSuccess: !dbError,
        dbError,
        credentials: {
          email: email.trim(),
          password: "As provided above"
        }
      });
      
    } catch (err) {
      setResult({
        success: false,
        message: "Unexpected error occurred",
        error: err
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="p-6">
        <h1 className="text-xl font-bold mb-4">Create Test User</h1>
        <p className="text-gray-600 mb-6">
          This utility lets you create a test user for authentication testing.
          It creates the user in both authentication and database.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters
            </p>
          </div>
          
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="User Name"
            />
          </div>
          
          <Button className="w-full" onClick={createUser} disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </Button>
        </div>
        
        {result && (
          <div className="mt-6">
            <Alert 
              className={result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}
            >
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
            
            {result.success && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold">Credentials:</h3>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Password:</strong> (as entered above)</p>
              </div>
            )}
            
            {(result.error || result.dbError) && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
                <pre>{JSON.stringify(result.error || result.dbError, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </Card>
      
      <div className="mt-6 text-center">
        <a href="/auth" className="text-blue-600 hover:underline">
          Return to login page
        </a>
      </div>
    </div>
  );
}
