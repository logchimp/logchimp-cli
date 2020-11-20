const {Command, flags} = require('@oclif/command')
const path = require('path')
const _ = require('lodash')

// utils
const Config = require('../../utils/config')

class ConfigSetCommand extends Command {
  async run() {
    // check for config file
    const currentDirectory = await process.cwd()

    const {flags} = this.parse(ConfigSetCommand)

    const config = new Config(path.join(currentDirectory, 'logchimp.config.json'))

    // Is config file empty?
    const isConfigEmpty = _.isEmpty(config.values)

    // Warn on configuration file not found
    if (isConfigEmpty) {
      this.warn('Logchimp configuration file doesn\'t exist.')
      return
    }

    if (flags.key && flags.value) {
      config.set(flags.key, flags.value).save()
    } else {
      this.warn('You have passed invalid key or value')
    }
  }
}

ConfigSetCommand.description = `Set a specific value in the configuration file
`

ConfigSetCommand.flags = {
  key: flags.string({char: 'k', description: 'name to print'}),
  value: flags.string({char: 'v', description: 'name to print'}),
}

module.exports = ConfigSetCommand
