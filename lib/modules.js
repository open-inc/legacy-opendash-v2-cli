const { exec } = require("child_process");
const homedir = require("os").homedir();
const path = require("path");
const fs = require("fs-extra");

function asyncExec(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function requireAsync(package, version, onFirstTime = () => null) {
  const cwd = path.resolve(homedir, ".opendash", "modules", package, version);
  const packagePath = path.resolve(cwd, "node_modules", package);

  const command = `npm install ${package}@${version}`;

  if (!(await fs.exists(packagePath))) {
    onFirstTime();

    await fs.ensureDir(cwd);

    await asyncExec(command, { cwd });
  }

  return require(packagePath);
}

module.exports = {
  requireAsync
};
