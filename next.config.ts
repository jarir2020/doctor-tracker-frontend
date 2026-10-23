/** Doctor Tracker: Configures Next.js component caching, CSS handling, and API proxy rewrites. */
import type { NextConfig } from "next";

const backendOrigin = (process.env.BACKEND_API_ORIGIN || "http://localhost:4000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendOrigin}/api/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
