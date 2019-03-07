const pkg = require("../package.json");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

const version = pkg.version;

const cwd = x => path.resolve(process.cwd(), x);

const cwdHash = () =>
  crypto
    .createHash("md5")
    .update(cwd(""))
    .digest("hex");

const temp = (...x) => path.resolve(os.tmpdir(), "opendash-v" + version, ...x);

module.exports = { cwd, temp, cwdHash };
