const path = require('path')
const execa = require('execa')
const fs = require('fs-extra')
const _ = require('lodash')

const CLI_PATH = path.resolve(__dirname, '..', '..', 'bin', 'run')
const runCommand = (args, options) => execa(CLI_PATH, args, options)

describe('config:generate command', () => {
  beforeEach(async () => {
    // fail-safe: delete any existing logchimp config at root directory
    const currentDirectory = await process.cwd()
    fs.removeSync(`${currentDirectory}/logchimp.config.json`)
    fs.removeSync(`${currentDirectory}/.env`)
  })

  describe('generate config', () => {
    it('with default values', async () => {
      const command = await runCommand(['config:generate'])

      expect(command.stdout).toBe('LogChimp configuration file succesfully created.')

      // Is config file empty?
      const currentDirectory = await process.cwd()
      const config = fs.readJsonSync(`${currentDirectory}/logchimp.config.json`)
      const isConfigEmpty = _.isEmpty(config)
      expect(isConfigEmpty).toBe(false)

      // server
      expect(config.server.local).toBe(false)
      expect(config.server.host).toBe('127.0.0.1')
      expect(config.server.port).toBe(3000)

      // database
      expect(config.database.port).toBe(5432)
      expect(config.database.ssl).toBe(true)

      // mail
      expect(config.mail.port).toBe(587)
    })

    it('with flags', async () => {
      const command = await runCommand([
        'config:generate',
        '--port=80',
        '--host=0.0.0.0',
        '--secretkey=mySecretKey',
        '--dbhost=postgres-db.logchimp.codecarrot.net',
        '--dbuser=pg_db_user',
        '--dbpass=myDatabasePassword',
        '--dbname=pg_db',
        '--dbport=5100',
        '--no-dbssl',
        '--mailservice=awesomeMailService',
        '--mailuser=mail_user',
        '--mailpass=myMailPassword',
        '--mailhost=mail-server.logchimp.codecarrot.net',
        '--mailport=587',
      ])

      expect(command.stdout).toBe('LogChimp configuration file succesfully created.')

      // validate config data
      const currentDirectory = await process.cwd()
      const config = fs.readJsonSync(`${currentDirectory}/logchimp.config.json`)

      // server
      expect(config.server.local).toBe(false)
      expect(config.server.host).toBe('0.0.0.0')
      expect(config.server.port).toBe(80)
      expect(config.server.secretkey).toBe('mySecretKey')
      // database
      expect(config.database.host).toBe('postgres-db.logchimp.codecarrot.net')
      expect(config.database.name).toBe('pg_db')
      expect(config.database.port).toBe(5100)
      expect(config.database.user).toBe('pg_db_user')
      expect(config.database.password).toBe('myDatabasePassword')
      expect(config.database.ssl).toBe(false)

      // mail
      expect(config.mail.service).toBe('awesomeMailService')
      expect(config.mail.host).toBe('mail-server.logchimp.codecarrot.net')
      expect(config.mail.user).toBe('mail_user')
      expect(config.mail.password).toBe('myMailPassword')
      expect(config.mail.port).toBe(587)
    })

    // it('with interactive mode', async () => {})

    it('with --force flag', async () => {
      // create config file with defaults
      await runCommand(['config:generate'])

      const command = await runCommand(['config:generate', '--force'])

      expect(command.stderr).toContain('Warning: This will overwrite the exisiting configuration file, if present.')

      // Is config file is not empty?
      const currentDirectory = await process.cwd()
      const config = fs.readJsonSync(`${currentDirectory}/logchimp.config.json`)
      const isConfigEmpty = _.isEmpty(config)
      expect(isConfigEmpty).toBe(false)
    })
  })

  it('config already exists', async () => {
    // generate config file
    await runCommand(['config:generate'])

    const command = await runCommand(['config:generate'])

    expect(command.stdout).toBe('Logchimp configuration file already exists.')

    // Is config file is not empty?
    const currentDirectory = await process.cwd()
    const config = fs.readJsonSync(`${currentDirectory}/logchimp.config.json`)
    const isConfigEmpty = _.isEmpty(config)
    expect(isConfigEmpty).toBe(false)
  })

  it('with both --env and --interactive present', async () => {
    // verify this throws an error
    expect.assertions(2)

    // try to generate a config file
    try {
      await runCommand(['config:generate', '--env', '--interactive'])
    } catch (error) {
      expect(error.message).toContain('You cannot use both --env and --interactive flag.')

      // Is config file is not empty?
      const currentDirectory = await process.cwd()
      const isConfigExists = fs.existsSync(`${currentDirectory}/logchimp.config.json`)
      expect(isConfigExists).toBe(false)
    }
  })

  it('with --env flag', async () => {
    const currentDirectory = await process.cwd()

    // create .env file if not already present
    const envIsPresent = fs.existsSync(`${currentDirectory}/.env`)

    if (!envIsPresent) {
      fs.writeFileSync(
        `${currentDirectory}/.env`,
        `LOGCHIMP_SERVER_PORT=3000
LOGCHIMP_SERVER_HOST=0.0.0.0
LOGCHIMP_SECRET_KEY=secret-key
LOGCHIMP_DB_HOST=localhost
LOGCHIMP_DB_PORT=5432
LOGCHIMP_DB_USER=logchimp
LOGCHIMP_DB_PASSWORD=secret-password
LOGCHIMP_DB_DATABASE=logchimpDB
LOGCHIMP_DB_SSL=true
LOGCHIMP_MAIL_SERVICE=service
LOGCHIMP_MAIL_HOST=mail_host
LOGCHIMP_MAIL_PORT=587
LOGCHIMP_MAIL_USER=mail_username
LOGCHIMP_MAIL_PASSWORD=mail_password`
      )
    }

    // generate config file
    const command = await runCommand(['config:generate', '--env'])

    expect(command.stdout).toContain('LogChimp configuration file succesfully created from environment variables')

    // validate configuration file
    const config = fs.readJsonSync(`${currentDirectory}/logchimp.config.json`)
    const isConfigEmpty = _.isEmpty(config)
    expect(isConfigEmpty).toBe(false)

    // server
    expect(config.server.host).toBe('0.0.0.0')
    expect(config.server.secretkey).toBe('secret-key')
    expect(config.server.port).toBe(3000)

    // database
    expect(config.database.host).toBe('localhost')
    expect(config.database.user).toBe('logchimp')
    expect(config.database.password).toBe('secret-password')
    expect(config.database.name).toBe('logchimpDB')
    expect(config.database.port).toBe(5432)
    expect(config.database.ssl).toBe(true)

    // mail
    expect(config.mail.service).toBe('service')
    expect(config.mail.host).toBe('mail_host')
    expect(config.mail.user).toBe('mail_username')
    expect(config.mail.password).toBe('mail_password')
    expect(config.mail.port).toBe(587)
  })

  it('with --env flag and default values', async () => {
    const currentDirectory = await process.cwd()

    // create .env file if not already present
    const envIsPresent = fs.existsSync(`${currentDirectory}/.env`)

    if (!envIsPresent) {
      // intentionally creating an empty .env file
      fs.writeFileSync(`${currentDirectory}/.env`, '')
    }

    // generate config file
    const command = await runCommand(['config:generate', '--env'])

    expect(command.stdout).toContain('LogChimp configuration file succesfully created from environment variables')

    // validate configuration file
    const config = fs.readJsonSync(`${currentDirectory}/logchimp.config.json`)
    const isConfigEmpty = _.isEmpty(config)
    expect(isConfigEmpty).toBe(false)

    // server
    expect(config.server.host).toBe('127.0.0.1')
    expect(config.server.secretkey).toBeUndefined()
    expect(config.server.port).toBe(3000)

    // database
    expect(config.database.host).toBeUndefined()
    expect(config.database.user).toBeUndefined()
    expect(config.database.password).toBeUndefined()
    expect(config.database.name).toBeUndefined()
    expect(config.database.port).toBe(5432)
    expect(config.database.ssl).toBe(true)

    // mail
    expect(config.mail.service).toBeUndefined()
    expect(config.mail.host).toBeUndefined()
    expect(config.mail.user).toBeUndefined()
    expect(config.mail.password).toBeUndefined()
    expect(config.mail.port).toBe(587)
  })
})
