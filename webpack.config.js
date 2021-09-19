const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.js'],
  },
  devServer: {
    static: '.',
  },
  devtool: 'inline-source-map',
};
