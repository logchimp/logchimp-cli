const fs = require('fs-extra');
const chalk = require("chalk");
const decompress = require('decompress');
const { Listr } = require('listr2');
const { Observable } = require('rxjs');
const execa = require('execa')

// utils
const removeDotFiles = require('../utils/remove-dot-files');
const yarn = require('../utils/yarn');

class Install {
	async run(argv) {
		const currentDirectory = await process.cwd();
		const dirIsEmpty = require("../utils/dir-is-empty");

		// Check if the directory is empty
		if (!dirIsEmpty(process.cwd())) {
			console.log(`${chalk.red("Error:")} Current directory is not empty, LogChimp cannot be installed here.`);
			return;
		}

		let local = false;
		// If command is `logchimp install --local` do a local install for development and testing
		if (argv[0] === '--local') {
			local = true;
		}

		const releaseLink = "https://github.com/logchimp/logchimp/archive/master.zip";
		const zipFileName = "logchimp.zip"

		const tasks = new Listr([
			{
				title: "Downloading LogChimp",
				task: ctx => {
					return new Observable(async subscriber => {
						try {
							// download source using curl command
							await execa('curl', [releaseLink, '-L', '-o', zipFileName])
						} catch (error) {
							console.log(error);
							subscriber.error(`${chalk.red("Error:")} ${error.originalMessage}`);
						}

						// decompress zipFileName into currentDirectory
						try {
							subscriber.next("Extracting files");
							const zipFile = `${currentDirectory}/${zipFileName}`;
							await decompress(zipFile, currentDirectory);
							ctx.currentDirectory = currentDirectory;

						} catch (error) {
							console.log(error);
						}

						try {
							subscriber.next("Copying files");

							// copy files to currentDirectory
							await fs.copySync(`${currentDirectory}/logchimp-master`, currentDirectory, {
								overwrite: true
							});

							// remove zipFileName file and 'logchimp-master' directory
							await fs.removeSync(`${currentDirectory}/${zipFileName}`)
							await fs.removeSync(`${currentDirectory}/logchimp-master`)

							// remove all dot files and folder if not local
							if (!local) {
								await removeDotFiles(currentDirectory);
							}
						} catch (error) {
							console.log(error);
						}

						subscriber.complete();
					})
				}
			},
			{
				title: "Installing dependencies",
				task: async ctx => {
					const args = ['install', '--no-emoji', '--no-progress'];

					return await yarn(args);
				}
			}
		]);

		try {
			await tasks.run();
		} catch (error) {
			console.log(error);
		}
	}

	help() {
		console.log(`
${chalk.bold("USAGE")}
  logchimp install [flags]

${chalk.bold("ADDITIONAL COMMANDS")}
  help      Help about any command

${chalk.bold("FLAGS")}
  --help      Show help for command

${chalk.bold("LEARN MORE")}
  Use 'logchimp <command> <subcommand> --help' for more information about a command.
  Read the manual at https://logchimp.codecarrot.net/docs/install/logchimp-cli/
`)
	}
};

module.exports = Install;
