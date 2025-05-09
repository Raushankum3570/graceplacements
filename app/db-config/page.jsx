'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

export default function DatabaseConfig() {
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(null);
  const [tableExists, setTableExists] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [sqlContent, setSqlContent] = useState('');

  useEffect(() => {
    checkDatabaseStatus();
    fetchSqlContent();
  }, []);

  const fetchSqlContent = async () => {
    try {
      const response = await fetch('/create-users-table.sql');
      const text = await response.text();
      setSqlContent(text);
    } catch (error) {
      console.error("Error fetching SQL content:", error);
      // Use a fallback SQL if fetch fails
      setSqlContent(`-- Create the Users table
CREATE TABLE IF NOT EXISTS "public"."Users" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
    }
  };

  const checkDatabaseStatus = async () => {
    setIsLoading(true);
    try {
      // Test database connection
      const { data, error } = await supabase
        .from('Users')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log("Database error:", error);
        setDbStatus({
          connected: true,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // Check specifically if table doesn't exist
        if (error.message.includes('does not exist')) {
          setTableExists(false);
        }
      } else {
        setDbStatus({ connected: true, success: true });
        setTableExists(true);
      }
    } catch (err) {
      console.error("Connection error:", err);
      setDbStatus({ connected: false, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const createUsersTable = async () => {
    setIsCreatingTable(true);
    setCreateResult(null);
    
    try {
      // The SQL script to create the Users table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS "public"."Users" (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          picture TEXT,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index for faster email lookups
        CREATE INDEX IF NOT EXISTS users_email_idx ON "public"."Users" (email);
        
        -- Enable Row Level Security
        ALTER TABLE "public"."Users" ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for row level security
        -- Allow users to select their own data
        CREATE POLICY "Users can view own data" ON "public"."Users"
          FOR SELECT USING (auth.uid()::text = email);
        
        -- Allow authenticated users to insert
        CREATE POLICY "Authenticated users can insert" ON "public"."Users"
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        -- Allow users to update their own data
        CREATE POLICY "Users can update own data" ON "public"."Users"
          FOR UPDATE USING (auth.uid()::text = email);
        
        -- Admin users can view all data
        CREATE POLICY "Admin users can view all data" ON "public"."Users"
          FOR SELECT USING (is_admin = true);
      `;
      
      // Execute the SQL with Supabase's rpc
      const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (error) {
        console.error("Error creating table:", error);
        setCreateResult({
          success: false,
          message: error.message,
          details: `Error Code: ${error.code}, Details: ${error.details || 'None'}`
        });
        
        // If the error is about the rpc function not existing
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          setCreateResult({
            success: false,
            message: "The exec_sql function doesn't exist in your Supabase instance.",
            details: "You'll need to manually run the SQL script in the Supabase SQL Editor.",
            needsManual: true
          });
        }
      } else {
        setCreateResult({
          success: true,
          message: "Users table created successfully!"
        });
        
        // Verify the table was created
        setTimeout(() => {
          checkDatabaseStatus();
        }, 1000);
      }
    } catch (err) {
      console.error("Execution error:", err);
      setCreateResult({
        success: false,
        message: "Failed to execute SQL",
        details: err.message,
        needsManual: true
      });
    } finally {
      setIsCreatingTable(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Database Configuration</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Status Check</CardTitle>
          <CardDescription>
            Checking for "public.Users" table in your Supabase database
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Checking database status...</span>
            </div>
          ) : (
            <div>
              {dbStatus?.connected ? (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="text-lg font-medium">Connected to Supabase database</span>
                  </div>
                  
                  {tableExists ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle>Users table exists</AlertTitle>
                      <AlertDescription>
                        The Users table exists and is accessible.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Missing Users table</AlertTitle>
                      <AlertDescription>
                        Error: {dbStatus?.error}
                        {dbStatus?.hint && <div className="mt-2"><strong>Hint:</strong> {dbStatus.hint}</div>}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Database connection failed</AlertTitle>
                  <AlertDescription>
                    Could not connect to Supabase: {dbStatus?.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={checkDatabaseStatus}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Refresh Status
          </Button>
        </CardFooter>
      </Card>
      
      {!tableExists && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fix Missing Users Table</CardTitle>
            <CardDescription>
              Create the required Users table in your Supabase database
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This will attempt to create the Users table directly from this application.
                If it fails, you'll need to run the SQL script manually in Supabase.
              </AlertDescription>
            </Alert>
            
            {createResult && (
              <Alert className={createResult.success ? "bg-green-50 border-green-200 mb-4" : "bg-red-50 border-red-200 mb-4"}>
                {createResult.success ? 
                  <CheckCircle className="h-4 w-4 text-green-600" /> : 
                  <XCircle className="h-4 w-4 text-red-600" />
                }
                <AlertTitle>{createResult.success ? "Success" : "Failed"}</AlertTitle>
                <AlertDescription>
                  {createResult.message}
                  {createResult.details && <div className="mt-2 text-sm">{createResult.details}</div>}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">SQL Script to Create Users Table</h3>
              <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
                <pre className="text-sm">{sqlContent}</pre>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              onClick={createUsersTable}
              disabled={isCreatingTable || tableExists}
              className="w-full sm:w-auto"
            >
              {isCreatingTable ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isCreatingTable ? "Creating Table..." : "Create Users Table"}
            </Button>
            
            <Link href="/SUPABASE-USERS-TABLE.md" target="_blank" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download SQL Script
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            After fixing the database issue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {tableExists ? (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Users table is ready</AlertTitle>
              <AlertDescription>
                You can now use authentication features in your application.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Fix Required</AlertTitle>
              <AlertDescription>
                Create the Users table to enable authentication features.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">1. Test Authentication</h3>
              <p className="text-sm text-gray-600">
                After fixing the database issue, try signing up and signing in to verify that authentication works correctly.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">2. Check Email Authentication</h3>
              <p className="text-sm text-gray-600">
                Make sure email authentication is properly configured in Supabase.
              </p>
              <Link href="/auth-config" className="mt-2 inline-block">
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                  Go to Email Auth Config →
                </Badge>
              </Link>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Link href="/auth">
            <Button variant="default">
              Go to Authentication Page
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
