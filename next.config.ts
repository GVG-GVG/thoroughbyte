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

    // Mark chromium + puppeteer as external (not bundled by webpack)
    serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],

    // Explicitly include chromium binary files in the serverless function output
    outputFileTracingIncludes: {
          '/api/generate-card': ['./node_modules/@sparticuz/chromium/**/*'],
    },

    // Increase serverless function timeout for card generation
    experimental: {
          serverActions: {
                  bodySizeLimit: '2mb',
          },
    },
};

export default nextConfig;
