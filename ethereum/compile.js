const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

// Delete build folder
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

// Read contract
const votethPath = path.resolve(__dirname, 'contracts', 'Voteth.sol');
const source = fs.readFileSync(votethPath, 'utf8');
const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath); // Create build folder if doesn't exist

// Add contracts to build dir
for (let contract in output) {
	fs.outputJsonSync(
		path.resolve(buildPath, contract.replace(':', '') + '.json'),
		output[contract]
	);
};