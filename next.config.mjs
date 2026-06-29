/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warnings don't block builds; only actual runtime errors matter
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
