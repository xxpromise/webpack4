const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ['./src/js/app.js', './src/index.html'],
  output: {
    filename: 'js/[name].[hash:8].js',   //添加了hash值, 实现静态资源的长期缓存
    publicPath: '/'  //所有输出资源公共路径
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: {
          loader: "eslint-loader"
        }
      },
      {
        oneOf: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader"
            }
          },
          {
            test: /\.less$/,
            use: [{
              loader: "style-loader"
            }, {
              loader: "css-loader"
            }, {
              loader: "less-loader"
            }]
          },
          {
            test: /\.(png|jpg|gif|svg)$/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: 8 * 1024,  // 8kb大小以下的图片文件都用base64处理
                  name: 'images/[name].[hash:8].[ext]'
                }
              }
            ]
          },
          {
            test: /\.(html)$/,
            use: {
              loader: 'html-loader'
            }
          },
          {
            loader: 'file-loader',
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            options: {
              name: 'media/[name].[hash:8].[ext]',
            },
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  mode: 'production',  //修改为生产环境
}