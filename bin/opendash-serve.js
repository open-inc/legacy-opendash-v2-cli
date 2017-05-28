const program = require('commander');

const server = require('live-server');

const cwd = require('../lib/cwd');

program
  .option('-p, --port <port>', 'Define a port, default is 8080.')
  .parse(process.argv);

const serverOptions = {
  root: cwd(program.args[0] || '.'),
  port: program.port || 8080,
  logLevel: 0,
  open: false,
  wait: 500,
};

server.start(serverOptions);
