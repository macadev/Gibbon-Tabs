#!/usr/bin/env node

// A script for developing a browser extension with live-reloading
// using Create React App (no need to eject).
// Run it instead of the "start" script of your app for a nice
// development environment.
// P.S.: Install webpack-extension-reloader before running it.

// Force a "development" environment in watch mode
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const fs = require("fs-extra");
const paths = require("react-scripts/config/paths");
const webpack = require("webpack");
const configFactory = require("react-scripts/config/webpack.config");
const colors = require("colors/safe");
const ExtensionReloader = require("webpack-extension-reloader");

// Create the Webpack config usings the same settings used by the "start" script
// of create-react-app.
const config = configFactory("development");

// The classic webpack-dev-server can't be used to develop browser extensions,
// so we remove the "webpackHotDevClient" from the config "entry" point.
config.entry = config.entry.filter(function (entry) {
  return !entry.includes("webpackHotDevClient");
});

// Edit the Webpack config by setting the output directory to "./build".
config.output.path = paths.appBuild;
paths.publicUrl = paths.appBuild + "/";

// Add the webpack-extension-reloader plugin to the Webpack config.
// It notifies and reloads the extension on code changes.
config.plugins.push(new ExtensionReloader());

// Start Webpack in watch mode.
const compiler = webpack(config);
const watcher = compiler.watch({}, function (err) {
  if (err) {
    console.error(err);
  } else {
    // Every time Webpack finishes recompiling copy all the assets of the
    // "public" dir in the "build" dir (except for the index.html)
    fs.copySync(paths.appPublic, paths.appBuild, {
      dereference: true,
      filter: (file) => file !== paths.appHtml,
    });
    // Report on console the succesfull build
    console.clear();
    console.info(colors.green("Compiled successfully!"));
    console.info("Built at", new Date().toLocaleTimeString());
    console.info();
    console.info("Note that the development build is not optimized.");
    console.info("To create a production build, use yarn build.");
  }
});
