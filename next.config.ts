import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify serves this app at the site root. Keep local builds root-based too
  // so the deployed asset paths match the public runtime.
  output: "export",
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
