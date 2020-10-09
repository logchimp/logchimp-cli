const debug = require("debug");

// commands
const install = require('./commands/install');
const version = require('./commands/version');
const help = require('./commands/help');

/**
 * Execute the CLI!
 *
 * @param argv array of string argument passed by process.argv
 */
const run = argv => {
	debug("Start bootstrap process")

	const firstArg = argv.shift();

	if (firstArg === 'help' || firstArg === '--help' || firstArg === '-h') {
		new help().run();
	} else if (firstArg === 'version') {
		// output LogChimp-CLI version
		new version().run(argv);
	} else if (firstArg === 'install') {
		new install().run(argv)
	} else {
		console.error(`Unrecognized command: '${firstArg}'. Run \`logchimp help\` for usage.`)
		process.exit(1);
	}
}

module.exports = {
	run
}
