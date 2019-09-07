// @ts-check

'use strict'

const path = require('path')

/** @type {import('webpack').Configuration} */
const config = {
  target: 'node',
  entry: path.resolve(__dirname, './src/index.ts'),
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'babel-loader'
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.json']
  },
  optimization: {
    minimize: false
  }
}

/** @type {import('webpack').Configuration} */
const webConfig = {
  ...config,
  target: 'web',
  output: {
    filename: 'emojify-browser.js'
  }
}

module.exports = [config, webConfig]
