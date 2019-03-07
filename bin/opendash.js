#!/usr/bin/env node

const program = require("commander");
const pkg = require("../package.json");

// console.log(`open.DASH CLI v${pkg.version}`);

program
  .version(pkg.version)

  .command("init <template> <name>", "Initiate a new instance or widget.")
  .command("build", "Build an Instance or a Widget.")

  .parse(process.argv);
