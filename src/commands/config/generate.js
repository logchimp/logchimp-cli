const {Command, flags} = require('@oclif/command')
const path = require('path')
const omgopass = require('omgopass')
const _ = require('lodash')

// utils
const Config = require('../../utils/config')
const askQuestions = require('../../utils/ask-questions')

class ConfigGenerateCommand extends Command {
  async run() {
    const currentDirectory = await process.cwd()

    const {flags} = this.parse(ConfigGenerateCommand)

    const config = new Config(path.join(currentDirectory, 'logchimp.config.json'))

    // Is config file empty?
    const isConfigEmpty = _.isEmpty(config.values)

    // Skip checking for existing configuration file with --force flag
    if (flags.force) {
      this.warn('This will overwrite the exisiting configuration file, if present.')
    } else if (!isConfigEmpty) {
      this.log('Logchimp configuration file already exists.')
      return
    }

    // Check for --interactive flag
    if (flags.interactive) {
      const generateConfig = await askQuestions()
      config.set(generateConfig).save()
      this.log('LogChimp configuration file succesfully created.')
      return
    }

      },
      },

    config.set(generateConfig).save()
    this.log('LogChimp configuration file succesfully created.')
  }
}

ConfigGenerateCommand.description = `Generate a new configuration for a LogChimp instance.
`

ConfigGenerateCommand.flags = {
  interactive: flags.boolean({
    char: 'i',
    description: 'Use interactive mode',
  }),
  force: flags.boolean({
    char: 'f',
    description: 'Overwrite the existing configuration file, if present.',
    default: false,
  }),
}

ConfigGenerateCommand.usage = ['config:generate [flags]']

ConfigGenerateCommand.examples = [
  '$ logchimp config:generate --force',
  '$ logchimp config:generate --defaults --force',
]

module.exports = ConfigGenerateCommand
