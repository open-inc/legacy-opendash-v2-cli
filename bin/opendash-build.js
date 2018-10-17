const path = require('path');
const fs = require('fs-extra');

const program = require('commander');
const inquirer = require('inquirer');

const webpack = require('webpack');
const server = require('live-server');
const pkgAssets = require('pkg-assets');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const autoprefixer = require('autoprefixer');

const call = require('../lib/call');
const cwd = require('../lib/cwd');

function logPath(x) {
  return x.replace(cwd('.'), '.');
}

function testJsFiles(x) {
  if (/\.js$/.test(x)) {
    const pathRel = path.normalize(x).replace(cwd(''), '');
    if (
      /(node_modules)/.test(x) &&
      !/node_modules[\/|\\]@?opendash[a-zA-Z0-9\-]*[\/|\\]/.test(pathRel)
    ) {
      // eslint-disable-line
      return false;
    }
    return true;
  }
  return false;
}

program
  .option('-t, --type <type>', "Either 'Module' or 'Instance'.")
  .option('-c, --clean', 'Clean old dist folder.')
  .option('-w, --watch', 'Watch the source files for changes.')
  .option('-s, --serve', 'Serve the dist folder.')
  .option('-o, --open', 'Open browser if serve mode is on.')
  .option('-m, --minify', 'Output will be minified.')
  .option(
    '-p, --port <port>',
    'Define a port, if serve mode is on. Default is 8080.',
  )
  .option(
    '--source-map <setting>',
    'Define the source-map type, see webpack.js.org/configuration/devtool',
  )
  .option(
    '--public-path <url>',
    'Set a public path, see webpack.js.org/concepts/output',
  )
  .parse(process.argv);

// const config = {};

const TYPES = ['Instance', 'Module'];

const DEFAULTS = {
  watch: program.watch || false,
  serve: program.serve || false,
  clean: program.clean || false,
  minify: program.minify || false,
  open: program.open || false,
  port: program.port || 8080,
  sourceMap: program.sourceMap || false,
  publicPath: program.publicPath || false,
};

const configPath = cwd('.opendashrc.json');

call(async () => {
  const questions = [];

  let options = {};

  if (await fs.pathExists(configPath)) {
    Object.assign(options, await fs.readJson(configPath));
  }

  if (program.type) {
    options.type = program.type;
  }

  if (!options.type || TYPES.indexOf(options.type) === -1) {
    questions.push({
      type: 'list',
      name: 'type',
      message: 'What do you want to build?',
      choices: ['Instance', 'Module'],
    });
  }

  if (questions.length > 0) { Object.assign(options, await inquirer.prompt(questions)); }

  options.dist = options.dist || 'dist';
  options.index = options.index || 'app/index.html';
  options.entry = options.entry || 'app/js/app.js';

  fs.writeJson(configPath, options, { spaces: 2 });

  options = Object.assign({}, DEFAULTS, options);

  const WEBPACK_CONFIG = {
    entry: {
      app: [require.resolve('babel-polyfill'), cwd(options.entry)],
    },
    output: {
      filename: '[name].js', // '[name].[chunkhash].js',
      path: cwd(options.dist),
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
                    require.resolve('babel-preset-env'),
                    {
                      targets: {
                        browsers: ['last 2 Chrome versions', 'ie >= 11'],
                      },
                    },
                  ],
                  // require.resolve('babel-preset-stage-2'),
                ],
                babelrc: false,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            use: ['css-loader'],
          }),
        },
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            use: [
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
          }),
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
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
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
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: mod =>
          mod.context && mod.context.indexOf('node_modules') !== -1,
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
      }),
      new ExtractTextPlugin({
        filename: '[hash]-[name].css',
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
    devtool: DEFAULTS.sourceMap,
    watch: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 500,
    },
  };

  if (options.clean) {
    console.log('Starting in clean-mode: Deleting old dist folder.');
    await fs.remove(WEBPACK_CONFIG.output.path);
  }

  if (options.watch) {
    console.log('Starting in watch-mode: Watching source code for changes.');
    WEBPACK_CONFIG.watch = true;
  }

  if (options.minify) {
    console.log('Starting in minify-mode: Output will be minified.');
    WEBPACK_CONFIG.plugins.push(new UglifyJsPlugin({
        sourceMap: options.sourceMap ? true : false // eslint-disable-line
    }));
  }

  // if (options.minify) {
  WEBPACK_CONFIG.plugins.push(new CopyWebpackPlugin([cwd('app/public')]));
  // }

  if (options.publicPath) {
    console.log('Starting in public-path-mode: ...');
    WEBPACK_CONFIG.output.publicPath = options.publicPath;
  }

  if (options.serve) {
    const serverOptions = {
      root: WEBPACK_CONFIG.output.path,
      port: options.port,
      open: options.open,
      logLevel: 0,
      wait: 500,
    };

    server.start(serverOptions);

    console.log(`Starting in serve-mode: Serving '${logPath(serverOptions.root)}' at 127.0.0.1:${serverOptions.port}`);
  }

  console.log('');

  pkgAssets(process.cwd(), `${WEBPACK_CONFIG.output.path}/assets/vendor`).then((assets) => {
    assets.map(asset =>
      console.log(`Asset(s) moved: ${logPath(asset.src)} -> ${logPath(asset.dest)}`));
  });

  webpack(WEBPACK_CONFIG, (err, stats) => {
    if (err) throw err;

    const statString = stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    });

    process.stdout.write(`\n${statString}\n\n`);
  });
});
