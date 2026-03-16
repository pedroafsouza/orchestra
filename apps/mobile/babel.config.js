module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Ensure babel searches upward from any file to find this config,
    // even for hoisted node_modules at the monorepo root.
    babelrcRoots: ['.', '../..'],
  };
};
