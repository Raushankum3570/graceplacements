export async function GET() {
  // Return an empty Chrome DevTools configuration
  return new Response(
    JSON.stringify({
      version: 1,
      domains: []
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}