require('dotenv').config()
const { Command, flags } = require('@oclif/command')
const path = require('path')
const omgopass = require('omgopass')
const _ = require('lodash')

// utils
const Config = require('../../utils/config')
const askQuestions = require('../../utils/ask-questions')

// generate random password
const generatePassword = () =>
  omgopass({
    minSyllableLength: 12,
  })

class ConfigGenerateCommand extends Command {
  async run() {
    const currentDirectory = await process.cwd()

    const { flags } = this.parse(ConfigGenerateCommand)

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

    // Throw an error if both --env and --interactive flags are present
    if (flags.interactive && flags.env) {
      this.error('You cannot use both --env and --interactive flag.')
    }

    // Check for --interactive flag
    if (flags.interactive) {
      const generateConfig = await askQuestions()
      config.set(generateConfig).save()
      this.log('LogChimp configuration file succesfully created.')
      return
    }

    // Check if --env flag is present
    if (flags.env) {
      const generateConfig = {
        server: {
          host: process.env.LOGCHIMP_SERVER_HOST || '127.0.0.1',
          port: _.toNumber(process.env.LOGCHIMP_SERVER_PORT) || 3000,
          secretkey: process.env.LOGCHIMP_SECRET_KEY,
        },
        database: {
          host: process.env.LOGCHIMP_DB_HOST,
          port: _.toNumber(process.env.LOGCHIMP_DB_PORT) || 5432,
          user: process.env.LOGCHIMP_DB_USER,
          password: process.env.LOGCHIMP_DB_PASSWORD,
          name: process.env.LOGCHIMP_DB_DATABASE,
          // dotenv returns all environment variables as strings
          ssl: process.env.LOGCHIMP_DB_SSL ? process.env.LOGCHIMP_DB_SSL === 'true' : true,
        },
        mail: {
          service: process.env.LOGCHIMP_MAIL_SERVICE,
          host: process.env.LOGCHIMP_MAIL_HOST,
          port: _.toNumber(process.env.LOGCHIMP_MAIL_PORT) || 587,
          user: process.env.LOGCHIMP_MAIL_USER,
          password: process.env.LOGCHIMP_MAIL_PASSWORD,
        },
      }

      config.set(generateConfig).save()
      this.log('LogChimp configuration file succesfully created from environment variables.')
      return
    }

    const generateConfig = {
      server: {
        local: flags.local,
        host: flags.host,
        port: flags.port,
        secretkey: flags.secretkey ? flags.secretkey : generatePassword(),
      },
      database: {
        host: flags.dbhost,
        name: flags.dbname,
        port: flags.dbport,
        user: flags.dbuser,
        password: flags.dbpass,
        ssl: flags.dbssl,
      },
      mail: {
        service: flags.mailservice,
        host: flags.mailhost,
        port: flags.mailport,
        user: flags.mailuser,
        password: flags.mailpass ? flags.mailpass : generatePassword(),
      },
    }

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
  env: flags.boolean({
    description: 'Create configuration file from environment variables',
    default: false,
  }),
  local: flags.boolean({
    description: 'Run LogChimp for local development/testing',
    default: false,
  }),

  // server
  host: flags.string({
    description: 'Server host',
    default: '127.0.0.1',
  }),
  port: flags.integer({
    description: 'Server port to listen on',
    default: 3000,
  }),
  secretkey: flags.string({
    description: 'Secret key for password validation (default auto generate random string)',
  }),

  // database flags
  dbhost: flags.string({
    description: 'Database host',
  }),
  dbuser: flags.string({
    description: 'Database username',
  }),
  dbpass: flags.string({
    description: 'Database password (default auto generate random password)',
  }),
  dbname: flags.string({
    description: 'Database name',
  }),
  dbport: flags.integer({
    description: 'Database port',
    default: 5432,
  }),
  dbssl: flags.boolean({
    description: 'Enable SSL for database (default true for production)',
    default: true,
    allowNo: true,
  }),

  // mail flags
  mailservice: flags.string({
    description: 'Mail service e.g. MailGun',
  }),
  mailuser: flags.string({
    description: 'Mail service SMTP username',
  }),
  mailpass: flags.string({
    description: 'Mail service SMTP password (default auto generate random password)',
  }),
  mailhost: flags.string({
    description: 'Mail service SMTP hostname',
  }),
  mailport: flags.integer({
    description: 'Mail service SMTP port',
    default: 587,
  }),
}

ConfigGenerateCommand.usage = ['config:generate [flags]']

ConfigGenerateCommand.examples = [
  '$ logchimp config:generate --force',
  '$ logchimp config:generate --dbhost=localhost --dbuser=username --dbname=database --dbport=5432',
  '$ logchimp config:generate --interactive',
  '$ logchimp config:generate --env',
]

module.exports = ConfigGenerateCommand
