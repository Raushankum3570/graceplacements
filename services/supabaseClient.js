import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// Add validation to help with debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!', {
    url: supabaseUrl ? 'Defined' : 'Missing',
    key: supabaseAnonKey ? 'Defined' : 'Missing'
  });
}

// Function to determine the site URL for redirects
const getSiteUrl = () => {
  // First priority: Use explicit NEXT_PUBLIC_SITE_URL if provided
  if (explicitSiteUrl) {
    console.log('Using environment-provided site URL:', explicitSiteUrl);
    return explicitSiteUrl;
  }
  
  // Second priority: Use window.location.origin in browser context
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('Using detected URL from browser:', origin);
    return origin;
  }
  
  // Fallback for server-side rendering
  console.log('Warning: Using fallback URL in server context (this should be overridden in client)');
  return explicitSiteUrl || 'https://your-production-domain.com';
};

// Check if we're in a development environment
const isDevelopment = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
  // In SSR context, check if NODE_ENV is development
  return process.env.NODE_ENV === 'development';
};

// Create Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Use pkce flow type for both development and production for consistency
      flowType: 'pkce',
      storageKey: 'grace_placement_auth',
      storage: {
        getItem: (key) => {
          if (typeof window !== 'undefined') {
            const item = localStorage.getItem(key);
            return item;
          }
          return null;
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
          }
        },
      },
      // Set redirect URL - this will be used for all auth operations
      redirectTo: getSiteUrl()
    },
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  }
);