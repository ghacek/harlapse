'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      devtools: PATHS.src + '/devtools.ts',
      popup: PATHS.src + '/popup.ts',
      panel: PATHS.src + '/panel.ts',
      background: PATHS.src + '/background.ts',
      content: PATHS.src + '/content.ts',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
