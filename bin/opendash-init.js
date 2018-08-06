/* eslint-disable quotes, no-console, prefer-destructuring */

const download = require('download');
const replaceLib = require('replace');
const inquirer = require('inquirer');
const Ora = require('ora');

const program = require('commander');

const call = require('../lib/call');
const cwd = require('../lib/cwd');

const spinner = new Ora({
  text: 'opendash init',
  spinner: 'dots',
});

function isset(input) {
  if (input) {
    return true;
  }

  return false;
}

program
  .option('--author-name <name>', 'Author name.')
  .option('--author-email <email>', 'Author email.')
  .parse(process.argv);

call(async () => {
  /*
   * Questions:
   */

  console.log();

  let options = {};
  let questions = [];

  if (program.args[0]) {
    options.template = program.args[0];
  }

  if (program.args[1]) {
    options.name = program.args[1];
  }

  if (program.authorName) {
    options.author = program.authorName;
  }

  if (program.authorEmail) {
    options.email = program.authorEmail;
  }

  questions = [
    {
      type: 'list',
      name: 'template',
      when: () => !isset(options.template),
      message: 'Select a template:',
      choices: [
        'instance',
        'widget',
      ],
    },
    {
      type: 'input',
      name: 'name',
      when: () => !isset(options.name),
      message: 'Pick a name:',
    },
    {
      type: 'input',
      name: 'author',
      when: () => !isset(options.author),
      message: 'Author Name:',
    },
    {
      type: 'input',
      name: 'email',
      when: () => !isset(options.email),
      message: 'Author Email:',
    },
  ];

  options = Object.assign(options, await inquirer.prompt(questions));
  questions = [];

  if (options.template === 'instance') {
    questions.push({
      type: 'list',
      name: 'uadapter',
      message: 'Select a user-adapter:',
      choices: [
        'local-storage',
        'parse',
        'baasbox',
      ],
    });

    questions.push({
      type: 'input',
      name: 'parse-url',
      when: session => session.uadapter === 'parse',
      message: '- User Adapter: Parse URL:',
    });

    questions.push({
      type: 'input',
      name: 'parse-collection',
      when: session => session.uadapter === 'parse',
      message: '- User Adapter: Parse Collection:',
    });

    questions.push({
      type: 'input',
      name: 'parse-applicationId',
      when: session => session.uadapter === 'parse',
      message: '- User Adapter: Parse Application ID:',
    });

    // questions.push({
    //   type: 'input',
    //   name: 'parse-jskey',
    //   when: session => session.uadapter === 'parse',
    //   message: '- User Adapter: Parse JavaScript Key:',
    // });

    questions.push({
      type: 'input',
      name: 'baasbox-endpoint',
      when: session => session.uadapter === 'baasbox',
      message: '- User Adapter: BaasBox Endpoint:',
    });

    questions.push({
      type: 'input',
      name: 'baasbox-collection',
      when: session => session.uadapter === 'baasbox',
      message: '- User Adapter: BaasBox Collection:',
    });

    questions.push({
      type: 'input',
      name: 'baasbox-appCode',
      when: session => session.uadapter === 'baasbox',
      message: '- User Adapter: BaasBox App Code:',
    });

    questions.push({
      type: 'list',
      name: 'dadapter',
      message: 'Select a data-adapter:',
      choices: [
        'skeleton',
        'example',
        'none',
      ],
    });

    questions.push({
      type: 'checkbox',
      name: 'widgets',
      message: 'Which widgets do you want to import?',
      choices: [
        'kpi',
        'highcharts-live',
        'highcharts-multi',
      ],
    });
  }

  options.custom = await inquirer.prompt(questions);

  console.log();

  /*
   * Download and generate:
   */

  spinner.text = `Download template '${options.template}'..`;
  spinner.start();

  const src = `https://api.github.com/repos/opendash-templates/${options.template}/tarball`;
  const dest = cwd(`opendash-${options.template}-${options.name}`);

  try {
    await download(src, dest, {
      extract: true,
      strip: 2,
    });
  } catch (error) {
    spinner.fail(`Template '${options.template}' not found.`);
    return;
  }

  spinner.text = `Preparing '${options.template}'..`;

  function replace(regex, replacement) {
    replaceLib({
      regex,
      replacement,
      paths: [dest],
      recursive: true,
      silent: true,
    });
  }

  replace('{{ opendash-template-name }}', options.name);
  replace('{{ opendash-template-maintainer-name }}', options.author);
  replace('{{ opendash-template-maintainer-email }}', options.email);

  if (options.template === 'instance') {
    generateCustomTemplate(options, replace);  // eslint-disable-line
  }

  spinner.succeed(`Initialization of '${options.name}' finished.`);

  console.log();
  console.log(`Next step:`);
  console.log(`cd ./opendash-${options.template}-${options.name}`);
  console.log(`npm install`);
  console.log(`npm run dev`);
});

function generateCustomTemplate(options, replace) {
  const widgets = [];

  let userAdapterPkg = '';
  let userAdapterApp = '';
  let userAdapterAppImport = '// none';

  let dataAdapterPkg = '';
  let dataAdapterApp = '';
  let dataAdapterAppImport = '// none';

  let widgetsPkg = '\n';
  let widgetsApp = 'const widgets = [\n';
  const widgetsAppImport = '// none';

  if (options.custom.uadapter) {
    if (options.custom.uadapter === 'local-storage') {
      userAdapterPkg = `"@opendash/user-adapter-local": "^4.0.0",`;
      userAdapterAppImport = `import userAdapter from '@opendash/user-adapter-local';`;
      userAdapterApp = `instance.registerUserAdapter(userAdapter);`;
    }

    if (options.custom.uadapter === 'parse') {
      userAdapterPkg = `"@opendash/user-adapter-parse": "^4.0.0",`;
      userAdapterAppImport = `import userAdapter from '@opendash/user-adapter-parse';`;
      userAdapterApp += `instance.registerUserAdapter(userAdapter, {\n`;
      userAdapterApp += `  url: '${options.custom['parse-url']}',\n`;
      userAdapterApp += `  collection: '${options.custom['parse-collection']}',\n`;
      userAdapterApp += `  applicationId: '${options.custom['parse-applicationId']}',\n`;
      userAdapterApp += `   // javaScriptKey: '${options.custom['parse-jskey']}',\n`;
      userAdapterApp += `});`;
    }

    if (options.custom.uadapter === 'baasbox') {
      userAdapterPkg = `"@opendash/user-adapter-baasbox": "^4.0.0",`;
      userAdapterAppImport = `import userAdapter from '@opendash/user-adapter-baasbox';`;
      userAdapterApp += `instance.registerUserAdapter(userAdapter, {\n`;
      userAdapterApp += `  endpoint: '${options.custom['baasbox-endpoint']}',\n`;
      userAdapterApp += `  collection: '${options.custom['baasbox-collection']}',\n`;
      userAdapterApp += `  appCode: '${options.custom['baasbox-appCode']}',\n`;
      userAdapterApp += `});`;
    }
  }

  if (options.custom.dadapter) {
    if (options.custom.dadapter === 'skeleton') {
      dataAdapterPkg = ``;
      dataAdapterApp = `instance.registerDataAdapter(demoDataAdapter);`;
      dataAdapterAppImport = `import demoDataAdapter from './skeleton.data-adapter.js';`;
    }

    if (options.custom.dadapter === 'example') {
      dataAdapterPkg = ``;
      dataAdapterApp = `instance.registerDataAdapter(demoDataAdapter);`;
      dataAdapterAppImport = `import demoDataAdapter from './example.data-adapter.js';`;
    }
  }

  if (options.custom.widgets) {
    options.custom.widgets.forEach((widget) => {
      widgets.push(`opendash-widget-${widget}`);
    });
  }

  widgets.forEach((w) => {
    widgetsPkg += `    "${w}": "https://api.github.com/repos/UniSiegenWiNeMe/${w}/tarball",\n`;
    widgetsApp += `  require('${w}').default,\n`;
  });

  widgetsApp += '];\n';
  widgetsApp += '\n';
  widgetsApp += 'instance.registerWidgets(widgets);';

  replace('{{ opendash-template-custom-user-adapter-pkg }}', () => userAdapterPkg);
  replace('{{ opendash-template-custom-user-adapter-app }}', () => userAdapterApp);
  replace('{{ opendash-template-custom-user-adapter-app-i }}', () => userAdapterAppImport);

  replace('{{ opendash-template-custom-data-adapter-pkg }}', () => dataAdapterPkg);
  replace('{{ opendash-template-custom-data-adapter-app }}', () => dataAdapterApp);
  replace('{{ opendash-template-custom-data-adapter-app-i }}', () => dataAdapterAppImport);

  replace('{{ opendash-template-custom-widgets-pkg }}', () => widgetsPkg);
  replace('{{ opendash-template-custom-widgets-app }}', () => widgetsApp);
  replace('{{ opendash-template-custom-widgets-app-i }}', () => widgetsAppImport);
}
