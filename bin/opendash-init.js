const download = require('download');
const replace = require('replace');
const inquirer = require('inquirer');

const program = require('commander');

const call = require('../lib/call');
const cwd = require('../lib/cwd');

program
  .option('--author-name <name>', 'Author name.')
  .option('--author-email <email>', 'Author email.')
  .parse(process.argv);

call(async () => {
  const questions = [];

  if (!program.args[0]) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Select a template:',
      choices: [
        'widget',
      ],
    });
  }

  if (!program.args[1]) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Pick a name:',
    });
  }

  if (!program.authorName) {
    questions.push({
      type: 'input',
      name: 'author',
      message: 'Author Name:',
    });
  }

  if (!program.authorEmail) {
    questions.push({
      type: 'input',
      name: 'email',
      message: 'Author Email:',
    });
  }

  const options = await inquirer.prompt(questions);

  const template = (program.args[0]) ? program.args[0] : options.template;
  const name = (program.args[1]) ? program.args[1] : options.name;
  const author = options.author || program.authorName;
  const email = options.email || program.authorEmail;

  const src = `https://api.github.com/repos/opendash-templates/${template}/tarball`;
  const dest = cwd(name);

  console.log(`Starting download of widget template '${template}' into './${name}'...`);

  await download(src, dest, {
    extract: true,
    strip: 2,
    // headers: {
    //   Authorization: user.header,
    // },
  });

  console.log(`Download of '${template}' finished.`);

  replace({
    regex: '{{ opendash-widget-name }}',
    replacement: name,
    paths: [dest],
    recursive: true,
    silent: true,
  });

  replace({
    regex: '{{ opendash-widget-developer-name }}',
    replacement: author,
    paths: [dest],
    recursive: true,
    silent: true,
  });

  replace({
    regex: '{{ opendash-widget-developer-email }}',
    replacement: email,
    paths: [dest],
    recursive: true,
    silent: true,
  });

  console.log(`Initialization of '${name}' finished.`);
});
