var webpack = require('webpack');

module.exports = {
  entry: [
    './js/app'
  ],
  output: {
    path: __dirname,
    // publicPath: '/build/',
    filename: './build/bundle.js'
  },
  plugins: [
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loaders: ['jsx'] }
    ]
  }
};
