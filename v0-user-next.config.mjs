/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'placeholder.com', 'via.placeholder.com'],
  },
  webpack(config) {
    // Support for SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  // No need for experimental section if we're not using any experimental features
  // Server Actions are now available by default
};

export default nextConfig;

