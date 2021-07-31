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
    await fs.removeSync(`${currentDirectory}/logchimp.config.json`)
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
    })

    it('with flags', async () => {
      const command = await runCommand([
        'config:generate',
        '--port=80',
        '--secretkey=mySecretKey',
        '--dbhost=postgres-db.logchimp.codecarrot.net',
        '--dbuser=pg_db_user',
        '--dbpass=myDatabasePassword',
        '--dbname=pg_db',
        '--dbport=51000',
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
      expect(config.local).toBe(false)
      expect(config.port).toBe(80)
      expect(config.secretkey).toBe('mySecretKey')
      // database
      expect(config.database.host).toBe('postgres-db.logchimp.codecarrot.net')
      expect(config.database.port).toBe(51000)
      expect(config.database.user).toBe('pg_db_user')
      expect(config.database.password).toBe('myDatabasePassword')
      expect(config.database.ssl).toBe(false)
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
  })

  it('with both --env and --interactive present', async () => {
    // verify this throws an error
    expect.assertions(1)

    // try to generate a config file
    try {
      await runCommand(['config:generate', '--env', '--interactive'])
    } catch (error) {
      expect(error.message).toContain('You cannot use both --env and --interactive flag.')
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
  })
})
