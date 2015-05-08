var webpack = require('webpack');
var path = require('path');

module.exports = {
  // If it gets slow on your project, change to 'eval':
  devtool: 'source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './js/bootstrap'
  ],
  output: {
    path: __dirname,
    publicPath: '/build/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['react-hot'], include: path.join(__dirname, 'js') },
      { test: /\.jsx$/, loaders: ['react-hot', 'jsx'], include: path.join(__dirname, 'js') }
    ]
  }
};
