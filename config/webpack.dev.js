const {resolve} = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ['./src/js/app.js', './src/index.html'],
  output: {
    filename: './js/[name].js',
    path: resolve(__dirname, './dist')
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
              loader: "babel-loader",
              options: {
                presets: ['@babel/preset-env'],
                plugins: [
                  "@babel/plugin-syntax-dynamic-import",
                  [
                    require.resolve("@babel/plugin-transform-runtime"),
                    {
                      "absoluteRuntime": false,
                      "corejs": false,
                      "helpers": false,
                      "regenerator": true,
                      "useESModules": false
                    }
                  ]
                ]
              }
            }
          },
          {
            test: /\.less$/,
            use: [{
              loader: "style-loader" // creates style nodes from JS strings
            }, {
              loader: "css-loader" // translates CSS into CommonJS
            }, {
              loader: "less-loader" // compiles Less to CSS
            }]
          },
          {
            test: /\.(png|jpg|gif|svg)$/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  outputPath: 'images/', //决定输出文件的位置
                  publicPath: 'images/',
                  limit: 8 * 1024,  // 8kb大小以下的图片文件都用base64处理
                  name: '[hash:7].[ext]'
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
              outputPath: 'media/',
              publicPath: 'media/',
              name: '[hash:7].[ext]',
            },
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
  ],
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
    open: true
  },
}