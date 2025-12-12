import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  images: {
    domains: ['drive.google.com', 'storage.googleapis.com', 'lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "google.com", // change to production domain
      },
      {
        protocol: "http",
        hostname: "localhost", // for docker development [localhost for dev]
        port: "8000",
      },
    ],
  },
};

export default nextConfig;
