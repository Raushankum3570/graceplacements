'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function EnvCheck() {
  const [envStatus, setEnvStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    async function checkEnvironment() {
      // Check if env vars are defined in the browser
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      setEnvStatus({
        url: supabaseUrl ? 'Defined' : 'Missing',
        key: supabaseKey ? 'Defined' : 'Missing'
      });

      // Test connection to Supabase
      try {
        const { error } = await supabase.from('Users').select('count', { count: 'exact', head: true });
        
        if (error) {
          setConnectionStatus({
            connected: false,
            message: `Connection failed: ${error.message}`,
            error
          });
        } else {
          setConnectionStatus({
            connected: true,
            message: 'Successfully connected to Supabase!'
          });
        }
      } catch (err) {
        setConnectionStatus({
          connected: false,
          message: `Connection error: ${err.message}`,
          error: err
        });
      }
      
      setIsLoading(false);
    }
    
    checkEnvironment();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Environment Check</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Supabase Environment Variables</h2>
        
        {isLoading ? (
          <p>Checking configuration...</p>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</div>
              <div className={envStatus.url === 'Missing' ? 'text-red-600 font-bold' : 'text-green-600'}>
                {envStatus.url}
              </div>
              
              <div className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</div>
              <div className={envStatus.key === 'Missing' ? 'text-red-600 font-bold' : 'text-green-600'}>
                {envStatus.key}
              </div>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Connection Test:</h3>
              
              {connectionStatus ? (
                <div className={`p-3 rounded ${connectionStatus.connected ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {connectionStatus.message}
                  
                  {connectionStatus.error && (
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
                      {JSON.stringify(connectionStatus.error, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <p>Testing connection...</p>
              )}
            </div>
          </div>
        )}
      </Card>
      
      <Button 
        onClick={() => window.location.reload()}
        className="mt-4"
      >
        Run Check Again
      </Button>
    </div>
  );
}
