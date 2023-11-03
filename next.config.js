module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.experiments = { topLevelAwait: true };
    }
    return config;
  },
};
