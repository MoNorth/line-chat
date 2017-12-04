const path = require('path')
const webpack = require('webpack')
const CompressionPlugin = require("compression-webpack-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: ['./src/index.js'],
  output: {
    filename: 'chat.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "less-loader"]
        })
      },
      {
        test: /.js?$/,
        include: [path.resolve(__dirname, 'src')],
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true
      }
    })
    // new ExtractTextPlugin("tata.css")
  ]
}
