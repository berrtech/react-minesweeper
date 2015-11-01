'use strict';

module.exports = {
  devtool: 'eval-source-map',
  entry: {
    src: './src/app.jsx'
  },
  output: {
    path: __dirname,
    filename: './src/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        exclude: /(node_modules|bower_components|bundle.js)/,
        loader: 'babel-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx']
  }
};