// FINAL, DOCUMENTATION-COMPLIANT CODE FOR: webpack.config.js

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const pkg = require('./package.json');

const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  mode: isProduction ? 'production' : 'development',
  entry: {
    plugin: './src/index.tsx',
    widgets: './src/widgets/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  devServer: {
    port: 8080,
    hot: true,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'tsx',
              target: 'es2020',
              sourcemap: isDevelopment,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', 'ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      chunks: ['plugin'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/manifest.json',
          to: 'manifest.json',
          transform(content) {
            const manifest = {
              manifestVersion: 1,
              id: pkg.name,
              name: pkg.name,
              author: pkg.author,
              repoUrl: pkg.repository.url,
              description: pkg.description,
              version: {
                major: parseInt(pkg.version.split('.')[0]),
                minor: parseInt(pkg.version.split('.')[1]),
                patch: parseInt(pkg.version.split('.')[2]),
              },
              enableOnMobile: false,
              requestNative: false,
              // ▼▼▼ THE FINAL, DOCUMENTATION-VERIFIED FIX IS HERE ▼▼▼
              // The format is an array of objects with 'scope' and 'permission' keys.
              requiredScopes: [
                {
                  "scope": "Document",
                  "permission": "ReadWrite"
                },
                {
                  "scope": "Rem",
                  "permission": "ReadWrite"
                }
              ]
            };
            return JSON.stringify(manifest, null, 2);
          },
        },
      ],
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
    isProduction &&
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
  ].filter(Boolean),
  devtool: isDevelopment ? 'cheap-module-source-map' : 'source-map',
  stats: 'errors-warnings',
};

module.exports = config;