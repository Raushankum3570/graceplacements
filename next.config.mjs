/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  eslint: {
    // Ignore ESLint errors during build to allow build to succeed
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        destination: '/api/chrome-devtools',
      },
    ];
  },
};

export default nextConfig;
