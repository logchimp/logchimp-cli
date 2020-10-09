const chalk = require("chalk");

class Help {
	run() {
		console.log(`
${chalk.bold("USAGE")}
  logchimp <command> <subcommands> [flags]

${chalk.bold("CORE COMMANDS")}
  install      Install a brand new instance of LogChimp

${chalk.bold("ADDITIONAL COMMANDS")}
  help      Help about any command

${chalk.bold("FLAGS")}
  --help         Show help for command
  --version      Show LogChimp-CLI version

${chalk.bold("LEARN MORE")}
  Use 'logchimp <command> <subcommand> --help' for more information about a command.
  Read the manual at https://logchimp.codecarrot.net/docs/install/logchimp-cli/

${chalk.bold("FEEDBACK")}
  Open an issue at https://github.com/logchimp/logchimp-cli/issues
`)
	}
};

module.exports = Help;
