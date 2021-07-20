const { Command } = require('@oclif/command')
const fs = require('fs-extra')
const decompress = require('decompress')
const { Listr } = require('listr2')
const { Observable } = require('rxjs')
const execa = require('execa')
const path = require('path')
const chalk = require('chalk')

// utils
const dirIsEmpty = require('../utils/dir-is-empty')
const Config = require('../utils/config')
const askQuestions = require('../utils/ask-questions')
const yarn = require('../utils/yarn')
const initServer = require('../utils/init-server')

class InstallCommand extends Command {
  async run() {
    const currentDirectory = await process.cwd()

    // Check if the directory is empty
    if (!dirIsEmpty(currentDirectory)) {
      this.error('Current directory is not empty, LogChimp cannot be installed here.')
    }

    // Initialize a new Config instance for LogChimp site installation
    const config = new Config(path.join(currentDirectory, 'logchimp.config.json'))

    const setupConfiguration = await askQuestions()
    config.set(setupConfiguration).save()

    const configuration = config.values

    // Check for database configuration
    const dbConfig = Boolean(configuration.database.name) && Boolean(configuration.database.user)
    if (!dbConfig) {
      this.error("Database configuration not provided, to learn more run 'logchimp install --help'")
    }

    // Check for database SSL
    if (configuration.local) {
      // eslint-disable-next-line require-atomic-updates
      process.env.NODE_ENV = 'development'
      configuration.database.ssl = false
    }

    const releaseLink = 'https://github.com/logchimp/logchimp/archive/master.zip'
    const zipFileName = 'logchimp.zip'

    const tasks = new Listr([
      {
        title: 'Downloading LogChimp',
        task: () => {
          return new Observable(async (subscriber) => {
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
        enabled: () => !configuration.local,
        task: () => {
          return new Listr([
            {
              title: 'Compiling frontend',
              task: () => {
                const command = execa('yarn', ['run', 'frontend:build'])

                return new Observable((subscribe) => {
                  subscribe.next('Building for production...')
                  command
                    .then(() => {
                      subscribe.complete()
                    })
                    .catch((error) => {
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
        enabled: () => !configuration.local,
        task: () => {
          return new Listr([...initServer()])
        },
      },
    ])

    try {
      await tasks.run()

      if (configuration.local) {
        this.log('')
        this.log(chalk.gray('--------------------'))
        this.log('')
        this.log(chalk.green('Your local environment is ready!'))
        this.log('You can refer to https://logchimp.codecarrot.net/docs/ for starting dev server locally.')
      } else {
        // Show success message for running LogChimp successfully
        this.log('')
        this.log(chalk.gray('--------------------'))
        this.log('')
        this.log(chalk.green('LogChimp is installed successfully!'))
        this.log(chalk.yellow.dim('Ctrl+C to shut down'))
      }
    } catch (error) {
      this.error(error)
    }
  }
}

InstallCommand.description = `Install a brand new instance of LogChimp
`

InstallCommand.usage = ['install [flags]']

module.exports = InstallCommand
