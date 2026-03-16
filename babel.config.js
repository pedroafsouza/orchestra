// Root babel config for monorepo. Expo's metro bundler needs this to
// transform hoisted packages (like expo-router) using babel-preset-expo.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
