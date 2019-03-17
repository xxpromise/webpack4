const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  entry: ['./src/js/app.js', './src/index.html'],
  output: {
    filename: 'js/[name].[chunkhash:8].js',   //添加了hash值, 实现静态资源的长期缓存
    chunkFilename: 'js/[name].[chunkhash:8].js', // 非入口 chunk 的名称
    publicPath: '/'  //所有输出资源的公共路径
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
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      "modules": false  //关掉babel将ES6模块化转化为commonjs，webpack自带了这个功能
                    }
                  ]
                ],
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
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader',
              'less-loader',
            ]
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
              },
              {
                loader: 'img-loader',
                options: {
                  plugins: [
                    require('imagemin-gifsicle')({
                      interlaced: false
                    }),
                    require('imagemin-mozjpeg')({
                      progressive: true,
                      arithmetic: false
                    }),
                    require('imagemin-pngquant')({
                      floyd: 0.5,
                      speed: 2
                    }),
                    require('imagemin-svgo')({
                      plugins: [
                        { removeTitle: true },
                        { convertPathData: false }
                      ]
                    })
                  ]
                }
              }
            ]
          },
          {
            test: /\.(html)$/,
            use: {
              loader: 'html-loader',
              options: {
                /*
                html-loader 接受 attrs 参数，表示什么标签的什么属性需要调用 webpack 的 loader 进行打包。
                比如 <img> 标签的 src 属性，webpack 会把 <img> 引用的图片打包，然后 src 的属性值替换为打包后的路径。
                使用什么 loader 代码，同样是在 module.rules 定义中使用匹配的规则。
  
                如果 html-loader 不指定 attrs 参数，默认值是 img:src, 意味着会默认打包 <img> 标签的图片。
                这里我们加上 <link> 标签的 href 属性，用来打包入口 index.html 引入的 favicon.png 文件。
                */
                attrs: ['img:src', 'link:href']
              }
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
      template: './src/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      }
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[chunkhash:8].css",
      chunkFilename: "css/[id].[chunkhash:8].css"
    }),
    new CleanWebpackPlugin(),
    new OptimizeCssAssetsPlugin({
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
    }),
    new webpack.HashedModuleIdsPlugin(),
    new WorkboxPlugin.GenerateSW({
      // 这些选项帮助 ServiceWorkers 快速启用
      // 不允许遗留任何“旧的” ServiceWorkers
      clientsClaim: true,
      skipWaiting: true,
      importWorkboxFrom: 'local',  //打包到本地， 默认值是'cdn' 访问的是国外cdn需要翻墙
      // include: [/\.html$/, /\.js$/, /\.css$/],  //包含资源
      // exclude: [/\.(png|jpg|gif|svg)/]  //排除资源
    })
  ],
  mode: 'production',  //修改为生产环境
  optimization: {
    /*
    上面提到 chunkFilename 指定了 chunk 打包输出的名字，那么文件名存在哪里了呢？
    它就存在引用它的文件中。这意味着一个 chunk 文件名发生改变，会导致引用这个 chunk 文件也发生改变。

    runtimeChunk 设置为 true, webpack 就会把 chunk 文件名全部存到一个单独的 chunk 中，
    这样更新一个文件只会影响到它所在的 chunk 和 runtimeChunk，避免了引用这个 chunk 的文件也发生改变。
    */
    runtimeChunk: true,
    
    splitChunks: {
      /*
      默认 entry 的 chunk 不会被拆分
      因为我们使用了 html-webpack-plugin 来动态插入 <script> 标签，entry 被拆成多个 chunk 也能自动被插入到 html 中，
      所以我们可以配置成 all, 把 entry chunk 也拆分了
      */
      chunks: 'all'
    }
  }
}