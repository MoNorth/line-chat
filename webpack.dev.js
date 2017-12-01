const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const html = require("html-webpack-plugin");
module.exports = {
  entry: { 
    index: './src/index'
  },
  output: {
    path: __dirname,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, 'src')],
         use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "less-loader"]
        })
      }
    ]
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    extensions: ['.js', '.css', '.json']
  },
  context: __dirname,
  devServer: {
    contentBase: __dirname,
    compress: true,
    port: 3332,
    hot: true
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin("index.css"),
    new html({
      template : 'index.html'
    })
  ]
}
