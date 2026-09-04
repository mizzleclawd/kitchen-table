import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves project sites below /<repository>. Keep local and
  // other hosts root-based, while producing correct asset links in Actions.
  basePath: process.env.GITHUB_ACTIONS ? "/kitchen-table" : undefined,
  output: "export",
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
