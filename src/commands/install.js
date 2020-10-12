const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const decompress = require('decompress')
const {Listr} = require('listr2')
const {Observable} = require('rxjs')
const execa = require('execa')
const path = require('path')
const omgopass = require('omgopass')

// utils
const dirIsEmpty = require('../utils/dir-is-empty')
const Config = require('../utils/config')
const yarn = require('../utils/yarn')
const initServer = require('../utils/init-server')

class InstallCommand extends Command {
  async run() {
    const currentDirectory = await process.cwd()

    // Check if the directory is empty
    if (!dirIsEmpty(currentDirectory)) {
      this.error('Current directory is not empty, LogChimp cannot be installed here.')
    }

    const {flags} = this.parse(InstallCommand)

    // Check for database configuration
    const dbConfig = (Boolean(flags.dbname) && Boolean(flags.dbuser))
    if (!dbConfig) {
      this.error('Database configuration not provided, to learn more run \'logchimp install --help\'')
    }

    // Check for database SSL
    if (flags.local) {
      process.env.NODE_ENV = 'development'
      flags.dbssl = false
    }

    // Initialize a new Config instance for LogChimp site installation
    const config = new Config(path.join(currentDirectory, 'logchimp.config.json'))

    const generateDatabasePassword = omgopass()
    // save database configuration
    config.set({
      database: {
        host: flags.dbhost,
        user: flags.dbuser,
        password: flags.dbpass ? flags.dbpass : generateDatabasePassword,
        name: flags.dbname,
        port: flags.dbport,
        ssl: flags.dbssl,
      },
    }).save()

    const secretKey = omgopass({
      minSyllableLength: 10,
    })
    // save secretKey and servertPort
    config.set({
      server: {
        port: flags.port,
        secretKey: flags.secretkey ? flags.secretkey : secretKey,
      },
    }).save()

    const releaseLink = 'https://github.com/logchimp/logchimp/archive/master.zip'
    const zipFileName = 'logchimp.zip'

    const tasks = new Listr([
      {
        title: 'Downloading LogChimp',
        task: () => {
          return new Observable(async subscriber => {
            try {
              // download source using curl command
              await execa('curl', [releaseLink, '-L', '-o', zipFileName])
            } catch (error) {
              this.error(error)
            }

            // decompress zipFileName into currentDirectory
            try {
              subscriber.next('Extracting files')
              const zipFile = `${currentDirectory}/${zipFileName}`
              await decompress(zipFile, currentDirectory)
            } catch (error) {
              this.error(error)
            }

            try {
              subscriber.next('Copying files')

              // copy files to currentDirectory
              await fs.copySync(`${currentDirectory}/logchimp-master`, currentDirectory, {
                overwrite: true,
              })

              // remove zipFileName file and 'logchimp-master' directory
              await fs.removeSync(`${currentDirectory}/${zipFileName}`)
              await fs.removeSync(`${currentDirectory}/logchimp-master`)
            } catch (error) {
              this.error(error)
            }

            subscriber.complete()
          })
        },
      },
      {
        title: 'Installing dependencies',
        task: () => {
          const args = ['install', '--no-emoji', '--no-progress']

          return yarn(args)
        },
      },
      {
        title: 'Setting up LogChimp',
        enabled: () => !flags.local,
        task: () => {
          return new Listr([
            {
              title: 'Compiling frontend',
              task: () => {
                const command = execa('yarn', ['run', 'frontend:build'])

                return new Observable(subscribe => {
                  subscribe.next('Building for production...')
                  command.then(() => {
                    subscribe.complete()
                  }).catch(error => {
                    subscribe.error(error)
                  })
                })
              },
            },
          ])
        },
      },
      {
        title: 'Starting LogChimp',
        enabled: () => !flags.local,
        task: () => {
          return new Listr([
            ...initServer(config),
          ])
        },
      },
    ])

    // LogChimp is ready to setup!

    try {
      await tasks.run()
    } catch (error) {
      this.error(error)
    }
  }
}

InstallCommand.description = `Install a brand new instance of LogChimp
`

const randomPassword = omgopass()

InstallCommand.flags = {
  port: flags.integer({
    description: 'Server port to listen on',
    default: 3000,
  }),
  secretkey: flags.string({
    description: 'Secret key for password validation (default auto generate random string)',
  }),
  local: flags.boolean({
    description: 'Run LogChimp for local development/testing',
    default: false,
  }),
  dbhost: flags.string({
    description: 'Database host',
    default: 'localhost',
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
}

InstallCommand.usage = ['install [flags]']

InstallCommand.examples = [
  '$ logchimp install',
  '$ logchimp install --local',
  '$ logchimp install --dbhost=localhost --dbuser=username --dbname=database --dbport=5432',
]

module.exports = InstallCommand
