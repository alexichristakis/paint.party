module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".tsx"],
        alias: {
          "@components": "./src/components",
          "@redux": "./src/redux",
          "@api": "./src/api",
          "@hooks": "./src/hooks",
          "@assets": "./src/assets",
          "@screens": "./src/screens",
          "@lib": "./src/lib",
          "@global": "./src/global",
        },
      },
    ],
  ],
};
