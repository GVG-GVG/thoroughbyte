import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Supabase Storage and OBS catalog images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'obscatalog.com',
      },
    ],
  },

  // Exclude chromium binary from serverless function tracing
  // (it's loaded dynamically by @sparticuz/chromium)
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],

  // Increase serverless function timeout for card generation
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
