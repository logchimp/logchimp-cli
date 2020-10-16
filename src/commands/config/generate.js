const {Command, flags} = require('@oclif/command')
const path = require('path')
const inquirer = require('inquirer')
const omgopass = require('omgopass')
const _ = require('lodash')

// utils
const Config = require('../../utils/config')

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

    // generate random password
    const generateDatabasePassword = omgopass()
    const generateSecretKey = omgopass({
      minSyllableLength: 10,
    })

    const configDefaults = {
      database: {
        dbhost: 'localhost',
        dbuser: 'logchimp',
        dbpass: generateDatabasePassword,
        dbname: 'logchimp',
        dbport: 5432,
        dbssl: true,
      },
      server: {
        port: 3000,
        secretkey: generateSecretKey,
      },
    }

    // Check for --defaults flag
    if (flags.defaults) {
      config.set(configDefaults).save()
      this.log('LogChimp configuration file succesfully created.')
      return
    }

    const generateConfig = await inquirer.prompt([
      // server
      {
        type: 'input',
        name: 'server.port',
        message: 'Server port to listen on',
        default: configDefaults.server.port,
      },
      {
        type: 'input',
        name: 'server.secretkey',
        message: 'Secret key for password validation (default to auto generate random string)',
      },
      // database
      {
        type: 'input',
        name: 'database.dbhost',
        message: 'Database host',
        default: configDefaults.database.dbhost,
      },
      {
        type: 'input',
        name: 'database.dbpass',
        message: 'Database password (default auto generate random password)',
      },
      {
        type: 'input',
        name: 'database.dbname',
        message: 'Database name',
        default: configDefaults.database.dbname,
      },
      {
        type: 'input',
        name: 'database.dbport',
        message: 'Database port',
        default: configDefaults.database.dbport,
      },
      {
        type: 'confirm',
        name: 'database.dbssl',
        message: 'Enable SSL for database (default true for production)',
        choices: ['true', 'false'],
        default: configDefaults.database.dbssl,
      },
    ])

    config.set(generateConfig).save()
    this.log('LogChimp configuration file succesfully created.')
  }
}

ConfigGenerateCommand.description = `Generate a new configuration for a LogChimp instance.
`

ConfigGenerateCommand.flags = {
  defaults: flags.boolean({
    char: 'd',
    description: 'Use defaults',
    default: false,
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
