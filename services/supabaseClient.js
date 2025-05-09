import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// Add some validation to help with debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!', { 
    url: supabaseUrl ? 'Defined' : 'Missing', 
    key: supabaseAnonKey ? 'Defined' : 'Missing' 
  });
}

// Determine site URL for redirects (works in both client and server components)
const getSiteUrl = () => {
  // If site URL is explicitly provided in environment variables, use that
  if (siteUrl) {
    console.log('Using environment-provided site URL:', siteUrl);
    return siteUrl;
  }
  
  // Otherwise, detect from browser
  if (typeof window !== 'undefined') {
    // Get the hostname and protocol
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Check for different environments
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // For local development, use the current protocol and port
      const port = window.location.port || '3000';
      // Use the actual hostname from the browser (localhost or 127.0.0.1)
      const localUrl = `${protocol}//${hostname}:${port}`;
      console.log('Using local development URL:', localUrl);
      return localUrl;
    } else {
      // For deployed environment, use the full origin with https protocol for production
      const origin = window.location.origin;
      console.log('Using detected production URL:', origin);
      return origin;
    }
  }
  
  // Fallback for server-side rendering when no window is available
  console.log('Using fallback URL (server context)');
  return 'http://127.0.0.1:3000';
};

// Create Supabase client with the correct OAuth handling
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'grace_placement_auth',
      storage: {
        getItem: (key) => {
          if (typeof window !== 'undefined') {
            const item = localStorage.getItem(key);
            console.log(`Auth storage: Retrieved ${key}`);
            return item;
          }
          return null;
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
            console.log(`Auth storage: Stored ${key}`);
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
            console.log(`Auth storage: Removed ${key}`);
          }
        },
      },
      // Set a global redirect URL for all auth operations
      redirectTo: getSiteUrl()
    },
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  }
)