import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // 90 is used for the class photographs, which are collages with fine detail.
    qualities: [75, 90],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Markdown twin: /about.md, /shop/some-painting.md, /index.md
        { source: "/index.md", destination: "/md" },
        { source: "/:path*.md", destination: "/md/:path*" },
        // Markdown twin by content negotiation: Accept: text/markdown
        {
          source: "/",
          has: [{ type: "header", key: "accept", value: "(.*)text/markdown(.*)" }],
          destination: "/md",
        },
        {
          source: "/:path((?!api|studio|md|_next).*)",
          has: [{ type: "header", key: "accept", value: "(.*)text/markdown(.*)" }],
          destination: "/md/:path",
        },
      ],
    };
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
