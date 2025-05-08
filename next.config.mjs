/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure static file serving for .well-known directory
  async rewrites() {
    return [
      {
        // Rewrite requests to serve the Chrome DevTools JSON file
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        destination: '/api/chrome-devtools'
      }
    ];
  }
};

export default nextConfig;
