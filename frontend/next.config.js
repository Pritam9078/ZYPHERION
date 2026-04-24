const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@creit.tech/stellar-wallets-kit', '@stellar/freighter-api', 'framer-motion'],
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/framer-motion/ }
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      '@stellar/freighter-api': '@stellar/freighter-api/build/index.min.js',
    };
    if (isServer) {
      config.externals.push('@creit.tech/stellar-wallets-kit');
    }
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    return config;
  }
};

module.exports = nextConfig;
