"use strict";

const path = require("path");
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");
const nextComposePlugins = require("next-compose-plugins");

const nextAlias = require("@blunck/next-alias");
const nextCss = require("@zeit/next-css");
const nextImages = require("next-images");
const nextFonts = require("next-fonts");
const nextProgressBar = require("next-progressbar");
const nextSass = require("@zeit/next-sass");
const nextSize = require("next-size");
const nextSourceMaps = require("@zeit/next-source-maps");
const nextTranspileModules = require("next-transpile-modules");

const nextBundleAnalyzer = ({ enabled = true }) => (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    const { isServer } = options;
    const { bundleAnalyzer: bundleAnalyzerOptions = {} } = nextConfig;

    if (enabled) {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: isServer
            ? "../analyze/server.html"
            : "./analyze/client.html",
          ...bundleAnalyzerOptions,
        })
      );
    }

    if (typeof nextConfig.webpack === "function") {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

const nextConfigDebugger = ({ enabled = false }) => (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    if (enabled) {
      const util = require("util");

      console.log("NEXT");
      console.log(util.inspect(nextConfig, { showHidden: false, depth: 7 }));
      console.log();
      console.log("WEBPACK");
      console.log(util.inspect(config, { showHidden: false, depth: 7 }));

      process.exit();
    }

    if (typeof nextConfig.webpack === "function") {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

const nextMaxify = ({ enabled }) => (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    if (enabled) {
      config.optimization.minimize = false;
    }

    if (typeof nextConfig.webpack === "function") {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

const nextSvgr = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack", "url-loader"],
    });

    if (typeof nextConfig.webpack === "function") {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

module.exports = (phase, { defaultConfig }) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  if (isDev) {
    /* ... */
  }

  const plugins = [
    // Debugger goes outside
    [nextConfigDebugger({ enabled: process.env.DEBUG_CONFIG === "true" })],

    // Styles
    [nextFonts, {}],
    [nextCss, {}],
    [nextSass, { cssModules: true }],

    // Images
    [nextImages, { exclude: /\.svg$/ }],
    [nextSvgr],

    // Fonts

    // Modules
    [
      nextAlias({
        "@": path.join(__dirname, "src"),
      }),
    ],
    [
      nextTranspileModules,
      {
        transpileModules: [],
      },
    ],

    [
      nextBundleAnalyzer({ enabled: process.env.ANALYZE === "true" }),
      {
        bundleAnalyzer: { openAnalyzer: false },
      },
    ],
    [nextMaxify({ enabled: process.env.MINIFY === "false" })],
    [
      nextProgressBar,
      {
        progressBar: { profile: false },
      },
    ],
    [nextSize],
    [nextSourceMaps({})],
  ];

  return nextComposePlugins(plugins, defaultConfig)(phase, {
    defaultConfig,
  });
};
