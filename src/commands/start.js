const {Command} = require('@oclif/command')
const {Listr} = require('listr2')
const path = require('path')
const chalk = require('chalk')

// utils
const validateConfig = require('../utils/validate-config')
const initServer = require('../utils/init-server')

class StartCommand extends Command {
  async run() {
    const currentDirectory = await process.cwd()

    const configFileExist = validateConfig(path.join(currentDirectory, 'logchimp.config.json'))

    if (!configFileExist) {
      this.warn('Working directory is not a recognisable LogChimp installation.')
      this.log('Run \'logchimp start\' again within a folder where LogChimp is installed with LogChimp CLI.')
      return
    }

    const tasks = new Listr([
      {
        title: 'Starting LogChimp',
        task: () => {
          return new Listr([
            ...initServer(),
          ])
        },
      },
    ])

    try {
      await tasks.run()

      // Show success message for starting LogChimp successfully
      this.log('')
      this.log(chalk.gray('--------------------'))
      this.log('')
      this.log(chalk.green('LogChimp is installed successfully!'))
      this.log(chalk.yellow.dim(('Ctrl+C to shut down')))
    } catch (error) {
      this.error(error)
    }
  }
}

StartCommand.description = `Start the LogChimp site
`

module.exports = StartCommand
