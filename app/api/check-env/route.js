export async function GET() {
  // This route safely returns configuration status without exposing secrets
  return new Response(JSON.stringify({
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKeyConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Not configured',
    nodeEnv: process.env.NODE_ENV
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
