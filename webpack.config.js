var path = require('path')
var webpack = require('webpack')

var publicPath = 'http://localhost:3000/';
// var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';

module.exports = {
	devtool:'eval-source-map',
	entry:'./server/public/js/index/index.js',
	output:{
    path: path.resolve(__dirname, './server/public/js/index'),
    publicPath,
    filename: 'index.bundle.js'
	},

	devServer: {
    historyApiFallback: true,
    noInfo: true
	}
}

// 生产环境
if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ])
}

