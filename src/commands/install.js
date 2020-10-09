const fs = require('fs-extra');
const chalk = require("chalk");
const request = require('superagent');
const decompress = require('decompress');

class Install {
	async run() {
		const dirIsEmpty = require("../utils/dir-is-empty");

		// Check if the directory is empty
		if (!dirIsEmpty(process.cwd())) {
			console.log(`${chalk.red("Error:")} Current directory is not empty, LogChimp cannot be installed here.`);
			return;
		}

		// let local = false;
		// If command is `logchimp install --local` do a local install for development and testing
		// if (argv[0] === '--local') {
		// 	local = true;
		// }

		const releaseLink = "https://github.com/logchimp/logchimp/archive/v0.2.0.zip";
		const zipFileName = "logchimp.zip"

		console.log("Downloading LogChimp");

		request
			.get(releaseLink)
			.on('error', (error) => {
				console.log(error);
			})
			.pipe(fs.createWriteStream(zipFileName))
			.on('finish', async () => {
				const currentDirectory = await process.cwd();

				try {
					await decompress(`${currentDirectory}/${zipFileName}`, currentDirectory)

					await fs.copySync(`${currentDirectory}/logchimp-0.2.0`, currentDirectory, {
						overwrite: true
					})
					await fs.removeSync(`${currentDirectory}/${zipFileName}`)
					await fs.removeSync(`${currentDirectory}/logchimp-0.2.0`)

					console.log(chalk.green('LogChimp is ready to setup!'))
				} catch (err) {
					console.error(err)
				}
			});
	}
};

module.exports = Install;
