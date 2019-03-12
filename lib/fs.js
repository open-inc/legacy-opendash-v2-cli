const pkg = require("../package.json");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

const version = pkg.version;

const homedir = os.homedir();
const tmpdir = os.tmpdir();

const homeDir = (...x) => path.resolve(homedir, ".opendash", ...x);

const modulesDir = (...x) => homeDir("modules", ...x);

const cwd = (...x) => path.resolve(process.cwd(), ...x);

const cwdHash = () =>
  crypto
    .createHash("md5")
    .update(cwd(""))
    .digest("hex");

const temp = (...x) => path.resolve(tmpdir, "opendash", version, ...x);

module.exports = { cwd, temp, cwdHash, homeDir, modulesDir };
