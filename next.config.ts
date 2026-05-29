import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse-new spawns a child process via fork() with a runtime path that
  // the bundler can't resolve. Keep it as a Node external so it's required at
  // runtime from node_modules instead of being bundled.
  serverExternalPackages: ["pdf-parse-new"],
};

export default nextConfig;
