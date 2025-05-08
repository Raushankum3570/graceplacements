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
    return siteUrl;
  }
  
  // Otherwise, detect from browser
  if (typeof window !== 'undefined') {
    // Check for localhost vs deployed environment
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // For local development, use 127.0.0.1 instead of localhost
      return 'http://127.0.0.1:3000';
    } else {
      // For deployed environment, use the full origin
      return window.location.origin;
    }
  }
  
  // Fallback for server-side rendering when no window is available
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