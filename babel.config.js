module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // 👈 Ye plugin APK crash rokne ke liye mandatory hai
  };
};