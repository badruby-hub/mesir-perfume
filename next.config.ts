import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pin the project root (a stray lockfile in a parent folder would
  // otherwise be picked as the workspace root).
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },

  async redirects() {
    // The contact page used to live at /contact — keep old links working.
    return [{ source: '/contact', destination: '/contacts', permanent: true }];
  },
};

export default nextConfig;
