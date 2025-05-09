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
  
  // Detect if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Get the hostname, protocol and current origin
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const currentOrigin = window.location.origin;
    
    // For localhost environments
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Ensure we use the exact current port to prevent any redirect issues
      console.log('Using exact local development URL:', currentOrigin);
      return currentOrigin;
    } else {
      // For deployed environments
      console.log('Using detected production URL:', currentOrigin);
      return currentOrigin;
    }
  }
  
  // Fallback for server-side rendering when no window is available
  // This is only used during SSR, the client-side value will be used for actual auth
  const fallbackUrl = process.env.NODE_ENV === 'production' ? 
    'https://grace-placement.vercel.app' : 'http://localhost:3000';
  console.log('Using fallback URL (server context):', fallbackUrl);
  return fallbackUrl;
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
      // Always use PKCE flow for better security and consistency
      flowType: 'pkce',
      // Ensure storage key is consistent
      storageKey: 'grace_placement_auth',
      // Add debug logging to track auth operations
      debug: process.env.NODE_ENV !== 'production',
      storage: {
        getItem: (key) => {
          // Only run in browser context
          if (typeof window !== 'undefined') {
            try {
              const item = localStorage.getItem(key);
              return item;
            } catch (err) {
              console.error('Auth storage getItem error:', err);
              return null;
            }
          }
          return null;
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(key, value);
            } catch (err) {
              console.error('Auth storage setItem error:', err);
            }
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem(key);
            } catch (err) {
              console.error('Auth storage removeItem error:', err);
            }
          }
        },
      },
      // Critical: Set a consistent redirect URL that works across environments
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