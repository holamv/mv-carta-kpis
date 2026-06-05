import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Permite transpilar el paquete compartido del monorepo (TS sin build).
  transpilePackages: ['@mv-quejas/shared'],
};

export default nextConfig;
