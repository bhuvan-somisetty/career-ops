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
  // Serve the captured product screenshots (in /public/showcase) as-is.
  images: { unoptimized: true },
};

export default nextConfig;
