const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

// Define copy patterns with error handling
const copyPatterns = [];

// Check if css directory exists and add it to patterns
const cssPath = path.resolve(__dirname, 'src/client/css');
if (fs.existsSync(cssPath)) {
  copyPatterns.push({ from: 'src/client/css', to: 'css' });
} else {
  console.warn('Warning: css directory not found at', cssPath);
}

// Check if assets directory exists and add it to patterns
const assetsPath = path.resolve(__dirname, 'src/client/assets');
if (fs.existsSync(assetsPath)) {
  copyPatterns.push({ from: 'src/client/assets', to: 'assets' });
} else {
  console.warn('Warning: assets directory not found at', assetsPath);
}

module.exports = {
  entry: './src/client/js/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
      filename: 'index.html'
    }),
    // Only add CopyWebpackPlugin if there are patterns to copy
    ...(copyPatterns.length > 0 ? [new CopyWebpackPlugin({ patterns: copyPatterns })] : [])
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 8080,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
};