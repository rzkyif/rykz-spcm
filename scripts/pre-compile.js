const fs = require('fs-extra');
const path = require('path');

const CONSTANTS_FILE = './src/constants.ts';
const INFO_FILE = './fomod/info.xml';
const DEFAULT_CONFIG = `
module.exports = {
	dataPathInstall: '',
	dataPathModules: ''
};
`;

if (!fs.existsSync('./scripts/config.js'))
	fs.writeFileSync('./scripts/config.js', DEFAULT_CONFIG);

let config = require('./config');
let package = JSON.parse(fs.readFileSync('./package.json').toString());

fs.writeFileSync(CONSTANTS_FILE, fs.readFileSync(CONSTANTS_FILE).toString()
  .replace(/(?<= VERSION = ['"]).*(?=['"];)/g, package.version)
  .replace(/(?<= CODENAME = ['"]).*(?=['"];)/g, package.name)
  .replace(/(?<= NAME = ['"]).*(?=['"];)/g, package.description)
);

fs.writeFileSync(INFO_FILE, fs.readFileSync(INFO_FILE).toString()
  .replace(/(?<=\<Version\>).*(?=\<\/Version\>)/g, package.version)
);

fs.copySync(
  path.join(config.dataPathModules, 'Platform', 'Modules'),
  './modules'
);

let tsconfig = JSON.parse(fs.readFileSync('./tsconfig-default.json'));
tsconfig.compilerOptions.outFile = './dist/' + package.name + '.js';
fs.writeFileSync('./tsconfig.json', JSON.stringify(tsconfig, null, 2));
