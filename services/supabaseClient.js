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
  // In browser context, use the current origin to ensure consistency
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    
    // Add detailed logging for debugging
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log(`Using exact local URL: ${origin}`);
      return origin;
    } else {
      // For production deployment, hardcode the vercel URL
      const productionUrl = 'https://graceplacement-two.vercel.app';
      console.log(`Using production URL: ${productionUrl} (instead of ${origin})`);
      return productionUrl;
    }
  }
    // Fallback for server-side rendering when no window is available
  const fallbackUrl = process.env.NODE_ENV === 'production' 
    ? 'https://graceplacement-two.vercel.app' 
    : 'http://localhost:3000';
  
  console.log(`Using fallback URL (server context): ${fallbackUrl}`);
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
      // Always use PKCE flow for better security
      flowType: 'pkce',
      storageKey: 'grace_placement_auth',
      // Enable debug mode for development only
      debug: process.env.NODE_ENV !== 'production',
      storage: {
        getItem: (key) => {
          if (typeof window !== 'undefined') {
            try {
              const item = localStorage.getItem(key);
              if (item) {
                console.log(`Auth storage: Retrieved ${key} successfully`);
              }
              return item;
            } catch (error) {
              console.error(`Error retrieving ${key} from localStorage:`, error);
              return null;
            }
          }
          return null;
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(key, value);
              console.log(`Auth storage: Stored ${key} successfully`);
            } catch (error) {
              console.error(`Error storing ${key} in localStorage:`, error);
            }
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem(key);
              console.log(`Auth storage: Removed ${key} successfully`);
            } catch (error) {
              console.error(`Error removing ${key} from localStorage:`, error);
            }
          }
        },
      },      // Set a global redirect URL for all auth operations
      redirectTo: getSiteUrl(),
      // Add cookie options for better cross-domain handling
      cookieOptions: {
        name: 'sb-auth-token',
        lifetime: 60 * 60 * 24 * 7, // 7 days
        domain: '',
        path: '/',
        sameSite: 'lax'
      },
      // Add onAuthStateChange callback so we can react to user state changes
      onAuthStateChange: (event, session) => {
        console.log('Auth state changed in client:', event);
        if (event === 'SIGNED_IN' && typeof window !== 'undefined') {
          // Dispatch a custom event that our components can listen for
          const authEvent = new CustomEvent('supabase-signed-in', { detail: { session } });
          window.dispatchEvent(authEvent);
        }
      }
    },
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  }
)