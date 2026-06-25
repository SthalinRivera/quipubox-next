import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // ✅ Agregar Cloudflare R2
      {
        protocol: 'https',
        hostname: 'ed51df4c9a917a0e59bfffc84ca1a42f.r2.cloudflarestorage.com',
        port: '',
        pathname: '/mis-evidencias/**', // Permite todas las imágenes dentro de esta carpeta
      },
      // ✅ Alternativa: si usas URL pública r2.dev (recomendado)
      {
        protocol: 'https',
        hostname: 'pub-f8b29d5e31df4b9190c4e3d651fc6e50.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;