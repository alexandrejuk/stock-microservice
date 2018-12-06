const shell = require('shelljs')
const R = require('ramda')
const path = require('path')

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

if (!shell.which('docker-compose')) {
  shell.echo('Sorry, this script requires docker-compose');
  shell.exit(1);
}

const getBranchName = R.pipe(
  R.filter(arg => arg.includes('branchName=')),
  R.head,
  arg => arg && arg.length > 0 ? arg.substring(arg.lastIndexOf("=") + 1) : null,
  R.ifElse(
    Boolean,
    arg => arg.substring(arg.lastIndexOf("=") + 1),
    R.always('master')
  )
)

// const gitCheckout = (branch) => 
const buildAndRun = () => {
  shell.echo(shell.pwd())
  shell.exec('docker-compose up --build --force-recreate -d')
  shell.echo('server is up and running')
}

Promise
  .resolve(process.argv)
  .then(getBranchName)
  .then(buildAndRun)

