import type { NextConfig } from "next";
import path from "node:path";

// Pin the workspace root to THIS app directory. Without this, the two
// lockfiles (repo root + web/) make Next/Turbopack infer the wrong root,
// which breaks the dev-mode React Client Manifest and hot reload.
const projectRoot = __dirname;

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  // Keep Prisma's engine out of the bundler so route handlers load it at runtime.
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Serve the captured product screenshots (in /public/showcase) as-is.
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: '/console/profile',
        destination: '/profile',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
