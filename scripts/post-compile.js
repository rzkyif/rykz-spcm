const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

function writeFileSyncRecursive(filename, content, options) {
	filename.split(path.sep).slice(0,-1).reduce( (last, folder)=>{
		let folderPath = last ? (last + path.sep + folder) : folder
		if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath)
		return folderPath
	})
	
	fs.writeFileSync(filename, content, options)
}

let { dataPathModules, dataPathInstall } = require('./config.js');
let { version: VERSION, name: CODENAME } = require('../package.json');

let outFile = require('../tsconfig.json').compilerOptions.outFile;
let jsName = CODENAME + '.js';
let settingsName = CODENAME + '-settings.txt';
let spcmName = CODENAME + '.json';

if (!dataPathInstall || !dataPathModules) {
	throw new Error('Missing `dataPathInstall` / `dataPathModules` in config.js');
}

let pluginsPath = path.join(dataPathInstall, `Platform\\Plugins`);
let spcmPath = path.join(dataPathInstall, `Platform\\SPCM`);

console.log(`Minifying ${jsName} with terser...`)
execSync(`yarn run terser ${outFile} -o ${outFile}`);

if (process.argv.includes('main')) {
	console.log(`Installing ${jsName}...`);
	writeFileSyncRecursive(path.join(pluginsPath, jsName), fs.readFileSync(outFile));
}

if (process.argv.includes('settings')) {
	console.log(`Installing ${settingsName} and ${spcmName}...`);
	writeFileSyncRecursive(path.join(pluginsPath, settingsName), fs.readFileSync('./src/settings.json'));
	writeFileSyncRecursive(path.join(spcmPath, spcmName), fs.readFileSync('./src/spcm.json'));
}

if (process.argv.includes('ui')) {
	console.log(`Installing UI files...`);
	fs.readdirSync('./dist/ui-min').forEach((file) => writeFileSyncRecursive(path.join(dataPathInstall, 'Platform\\UI', CODENAME, file), fs.readFileSync(path.join('./dist/ui-min', file))));
}

if (process.argv.includes('zip')) {
	console.log(`Zipping build...`);
	let archive = archiver('zip');
	archive.pipe(fs.createWriteStream(`./dist/${CODENAME}-${VERSION}.zip`));

	// settings and spcm
	archive.file('./src/settings.json', {name: '/r/Platform/Plugins/'+settingsName});
	archive.file('./src/spcm.json', {name: '/r/Platform/SPCM/'+spcmName});

	// example settings and spcm
	archive.file('./docs/examples/example-settings.json', {name: '/e/Platform/Plugins/example-raw-settings.txt'});
	archive.file('./docs/examples/example-settings.json', {name: '/e/Platform/Plugins/example-settings.txt'});
	archive.file('./docs/examples/example-spcm.json', {name: '/e/Platform/SPCM/example.json'});

	// fomod
	archive.directory('./fomod', 'fomod')

	// main file
	archive.file('./dist/'+jsName, {name: '/r/Platform/Plugins/'+jsName});

	// dummy file
	archive.append('This is just a dummy file that helps with Mod Organizer 2 installation.', {name: 'r/SKSE/dummy-rykz-spcm.txt'});

	// ui
	archive.directory('./dist/ui-min', `/r/Platform/UI/${CODENAME}`);

	archive.finalize();
}
