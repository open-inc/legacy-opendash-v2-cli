const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const WebpackConfig = require('../lib/webpack-config');

module.exports = async (options) => {
  const config = WebpackConfig(options);

  const compiler = webpack(config);

  if (options.serve) {
    const app = express();

    app.use(
      webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
      }),
    );

    app.listen(options.port, () => {
      console.log(
        `Starting in serve-mode: Serving on http://127.0.0.1:${options.port}`,
      );
    });
  }
};
