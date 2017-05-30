#!/usr/bin/env node

const program = require('commander');
const semver = require('semver');
const latest = require('latest-version');
const pkg = require('../package.json');
const call = require('../lib/call');

call(async () => {
  console.log(`open.DASH CLI v${pkg.version}`);

  const remoteVersion = await latest('opendash-cli');

  if (semver.gt(remoteVersion, pkg.version)) {
    console.log(`There is a new version (${remoteVersion}) of opendash-cli available, install with:\n  npm i -g opendash-cli`);
  }

  program
    .version(pkg.version)

    .command('init <template> <name>', 'Initiate a new instance or widget.')
    .command('build', 'Build an Instance or a Widget.')
    .command('serve [path]', 'Starts a dev server in the current directory and on the given port.')

    .parse(process.argv);
});
