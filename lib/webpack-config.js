const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const autoprefixer = require('autoprefixer');

const cwd = require('../lib/cwd');

const DEV = true;

function testJsFiles(x) {
  if (/\.js$/.test(x)) {
    const pathRel = path.normalize(x).replace(cwd(''), '');
    if (
      /(node_modules)/.test(x)
      && !/node_modules[\/|\\]@?opendash[a-zA-Z0-9\-]*[\/|\\]/.test(pathRel)
    ) {
      // eslint-disable-line
      return false;
    }
    return true;
  }
  return false;
}

module.exports = (options) => {
  const WEBPACK_CONFIG = {
    mode: 'development',
    entry: {
      app: [require.resolve('@babel/polyfill'), cwd(options.entry)],
    },
    output: {
      filename: '[name].js', // '[name].[chunkhash].js',
      path: cwd(options.dist),
    },
    resolve: {
      alias: {
        // "@babel/polyfill": require.resolve("@babel/polyfill"),
        // "@babel/runtime": require.resolve("@babel/runtime")
      },
    },
    module: {
      rules: [
        {
          test: testJsFiles,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    require.resolve('@babel/preset-env'),
                    {
                      useBuiltIns: 'entry',
                      targets: {
                        browsers: ['last 2 Chrome versions', 'ie >= 11'],
                      },
                    },
                  ],
                ],
                // plugins: [require.resolve("@babel/plugin-transform-runtime")],
                babelrc: false,
              },
            },
          ],
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                minimize: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [autoprefixer()],
              },
            },
            {
              loader: 'sass-loader',
              options: {},
            },
          ],
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                minimize: true,
                removeComments: true,
                collapseWhitespace: true,
              },
            },
          ],
        },
        {
          test: /\.(png|jpg|gif|svg|woff|woff2|eot|ttf)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[hash]-[name].[ext]',
                // outputPath: 'assets/',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: DEV ? '[name].css' : '[name].[hash].css',
        chunkFilename: DEV ? '[id].css' : '[id].[hash].css',
      }),
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true,
        },
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: cwd(options.index),
        inject: true,
        chunksSortMode: 'dependency',
        hash: false,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
        },
      }),
    ],
    resolveLoader: {
      modules: [
        path.resolve(__dirname, '..', 'node_modules'),
        cwd('node_modules'),
      ],
      extensions: ['.js', '.json'],
      mainFields: ['loader', 'main'],
    },
    devtool: options.sourceMap,
    watch: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 500,
    },
  };

  if (options.watch) {
    console.log('Starting in watch-mode: Watching source code for changes.');
    WEBPACK_CONFIG.watch = true;
  }

  if (options.minify) {
    console.log('Starting in minify-mode: Output will be minified.');
    WEBPACK_CONFIG.plugins.push(
      new UglifyJsPlugin({
        sourceMap: options.sourceMap ? true : false // eslint-disable-line
      }),
    );
  }

  if (options.publicPath) {
    console.log('Starting in public-path-mode: ...');
    WEBPACK_CONFIG.output.publicPath = options.publicPath;
  }

  return WEBPACK_CONFIG;
};
