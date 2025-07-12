/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing configuration...
  experimental: {
    // This is required for wasm modules like tiktoken
    asyncWebAssembly: true,
  },
};

module.exports = nextConfig;
