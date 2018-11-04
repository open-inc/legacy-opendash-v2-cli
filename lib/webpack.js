const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const WebpackConfig = require('../lib/webpack-config');

module.exports = async (options) => {
  const config = WebpackConfig(options);

  if (options.serve) {
    const compiler = webpack(config);
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
  } else {
    const compiler = webpack(config, (err, stats) => {
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
  }
};
