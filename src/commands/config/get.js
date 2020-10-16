const {Command, flags} = require('@oclif/command')
const path = require('path')
const _ = require('lodash')

// utils
const Config = require('../../utils/config')

class ConfigGetCommand extends Command {
  async run() {
    // check for config file
    const currentDirectory = await process.cwd()

    const {flags} = this.parse(ConfigGetCommand)

    const config = new Config(path.join(currentDirectory, 'logchimp.config.json'))

    // Is config file empty?
    const isConfigEmpty = _.isEmpty(config.values)

    // Warn on configuration file not found
    if (isConfigEmpty) {
      this.warn('Logchimp configuration file doesn\'t exist.')
      return
    }

    if (flags.key) {
      this.log(config.get(flags.key, {}))
    } else {
      this.log('Pass the --key flag to get the value')
    }
  }
}

ConfigGetCommand.description = `Get a specific value from the configuration file
`

ConfigGetCommand.flags = {
  key: flags.string({char: 'k', description: 'key of which you want to get the value'}),
}

ConfigGetCommand.usage = ['config:get [flags]']

ConfigGetCommand.examples = [
  '$ logchimp config:get --key database.port',
  '$ logchimp config:get --key server.secretkey',
]

module.exports = ConfigGetCommand
