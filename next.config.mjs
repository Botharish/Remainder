/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Convex generates types after `convex dev`; don't block builds before that.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
