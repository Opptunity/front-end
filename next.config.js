let userConfig = undefined
try {
  userConfig = require('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  reactStrictMode: false,
  env: {
    // Expose WORKOS_CLIENT_ID to client as NEXT_PUBLIC_WORKOS_CLIENT_ID
    // Note: This is a fallback - we now also have a server API endpoint
    NEXT_PUBLIC_WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID || '',
  },
  webpack: (config, { isServer }) => {
    // Handle node: protocol
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      buffer: require.resolve('buffer/'),
      fs: false,
      path: false,
      os: false,
    };

    // Only exclude nodemailer from client bundles
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push('nodemailer');
    }

    // Add polyfill plugins
    if (!isServer) {
      const webpack = require('webpack');
      config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      ];
    }

    return config;
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

module.exports = nextConfig 