/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization — using remotePatterns (images.domains is deprecated)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.mapbox.com',
      },
      {
        protocol: 'https',
        hostname: '**.google.com',
      },
    ],
  },

  // Output configured for Vercel
  output: 'standalone',
}

module.exports = nextConfig