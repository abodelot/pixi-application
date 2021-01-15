const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode: 'development',
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    },
  },
  devServer: {
    contentBase: '.',
  },
  devtool: 'inline-source-map',
};
