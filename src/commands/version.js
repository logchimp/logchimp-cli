const chalk = require('chalk');

class Version {
	run() {
		const npmPackage = require("../../package.json");
		console.log(`LogChimp-CLI version: ${chalk.cyan(npmPackage.version)}`);
	}
};

module.exports = Version;
