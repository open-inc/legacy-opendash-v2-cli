const fs = require('fs-extra');

const program = require('commander');

const webpack = require('../lib/webpack');

const cwd = require('../lib/cwd');

program
  .option('-t, --type <type>', "Either 'Module' or 'Instance'.")
  // .option('-c, --clean', 'Clean old dist folder.')
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

async function init() {
  const DEFAULTS = {
    watch: program.watch || false,
    serve: program.serve || false,
    // clean: program.clean || false,
    minify: program.minify || false,
    open: program.open || false,
    port: program.port || 8080,
    sourceMap: program.sourceMap || false,
    publicPath: program.publicPath || false,
  };

  const configPath = cwd('.opendashrc.json');

  let options = {};

  if (!(await fs.pathExists(configPath))) {
    throw new Error('Not an open.DASH instance.');
  }

  // Object.assign(options, await fs.readJson(configPath));

  options.dist = options.dist || 'dist';
  options.index = options.index || 'app/index.html';
  options.entry = options.entry || 'app/js/app.js';

  fs.writeJson(configPath, options, { spaces: 2 });

  options = Object.assign({}, DEFAULTS, options);

  console.log('');

  await webpack(options);
}

init().then(null, error => console.error(error));
