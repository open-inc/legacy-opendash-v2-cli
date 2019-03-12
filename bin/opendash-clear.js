const fs = require("fs-extra");
const program = require("commander");

const { cwd, cwdHash, temp, modulesDir, homeDir } = require("../lib/fs");

const { requireAsync } = require("../lib/modules");

program
  .option("--temp", "Clear caches in the temp folder.")
  .option("--build-cache", "Clear build caches in the temp folder.")
  .option("--modules", "Clear caches of installed modules.")
  .option("--user", "Remove the ~/.opendash folder.")
  .parse(process.argv);

async function init() {
  const configPath = cwd(".opendashrc.json");

  if (!(await fs.pathExists(configPath))) {
    throw new Error("Not an open.DASH instance.");
  }

  const dirs = [];

  if (program.temp) {
    console.log("- Clear caches in the temp folder.");
    dirs.push(temp(".."));
  }

  if (program.user) {
    console.log("- Remove the ~/.opendash folder.");
    dirs.push(homeDir("."));
  }

  if (!program.user && program.modules) {
    console.log("- Clear caches of installed modules.");
    dirs.push(modulesDir("."));
  }

  if (!program.temp && program.buildCache) {
    console.log("- Clear build caches in the temp folder.");
    dirs.push(temp(cwdHash()));
  }

  const promises = dirs.map(d => fs.remove(d));

  await Promise.all(promises);
}

init().then(null, error => console.error(error));
