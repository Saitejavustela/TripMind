export interface VercelConfig {
  framework?: string;
  rewrites?: Array<{ source: string; destination: string }>;
  headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
  crons?: Array<{ path: string; schedule: string }>;
}

export const config: VercelConfig = {
  framework: 'nextjs',
  rewrites: [
    { source: '/api/trips/:path*', destination: '/app/api/trips/:path*' },
    { source: '/api/hotels/:path*', destination: '/app/api/hotels/:path*' },
    { source: '/api/restaurants/:path*', destination: '/app/api/restaurants/:path*' },
    { source: '/api/attractions/:path*', destination: '/app/api/attractions/:path*' },
    { source: '/api/visa/:path*', destination: '/app/api/visa/:path*' },
  ],
  headers: [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
    {
      source: '/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
  crons: [
    { path: '/api/scheduled/cleanup-expired-sessions', schedule: '0 2 * * *' },
    { path: '/api/scheduled/update-travel-data', schedule: '0 */6 * * *' },
  ],
};
