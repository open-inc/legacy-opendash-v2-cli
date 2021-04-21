const fs = require("fs-extra");
const program = require("commander");

const { cwd, cwdHash, temp } = require("../lib/fs");

const { requireAsync } = require("../lib/modules");

program
  .option("-w, --watch", "Watch the source files for changes.")
  .option("-s, --serve", "Serve the dist folder.")
  .option("-o, --open", "Open browser if serve mode is on.")
  .option("-p, --port <port>", "Set a port for serve mode. Default is 8080.")
  .parse(process.argv);

async function init() {
  const options = {
    watch: program.watch || false,
    serve: program.serve || false,
    open: program.open || false,
    port: program.port || 8080
  };

  const configPath = cwd(".opendashrc.json");

  if (!(await fs.pathExists(configPath))) {
    throw new Error("Not an open.DASH instance.");
  }

  const instanceHash = cwdHash();

  /*
  const Bundler = await requireAsync("parcel-bundler", "1.12.4", () => {
    console.log("Requesting the build tool for the first time.");
    console.log("It will download now.");
    console.log("This might take some time.");
  });
*/
  const Bundler = await require("parcel-bundler");
  const bundleEntryFile = cwd("app/index.html");

  const bundleConfig = {
    outDir: cwd("dist"),
    cache: true,
    cacheDir: temp(instanceHash, "cache"),
    watch: options.watch,
    minify: !options.serve && !options.watch,
    detailedReport: true
  };

  if (!options.serve && !options.watch) {
    bundleConfig.production = true;
    process.env.NODE_ENV = process.env.NODE_ENV || "production";
  } else {
    process.env.NODE_ENV = process.env.NODE_ENV || "development";
  }

  const bundler = new Bundler(bundleEntryFile, bundleConfig);

  if (options.serve) {
    const bundle = await bundler.serve(options.port);
  } else {
    const bundle = await bundler.bundle();
  }

  // Object.assign(options, await fs.readJson(configPath));

  // fs.writeJson(configPath, options, { spaces: 2 });
}

init().then(null, error => console.error(error));
