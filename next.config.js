/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "yourdomain.com" }],
        destination: "https://www.yourdomain.com/:path*",
        permanent: true,
      },
    ];
  },
  // For App Router API routes (which we're using)
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "openai"],
  },
  // Ensure env vars are available at runtime
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};

module.exports = nextConfig;
