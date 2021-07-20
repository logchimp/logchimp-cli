const { Command, flags } = require('@oclif/command')
const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const { Listr } = require('listr2')

class UninstallCommand extends Command {
  async run() {
    const { flags } = this.parse(UninstallCommand)
    const currentDirectory = await process.cwd()

    /**
     * Is LogChimp is installed in current directory
     *
     * We're validating the LogChimp installation
     * by checking for logchimp.config.json existance
     */
    const configurationFile = await fs.pathExistsSync(path.join(currentDirectory, 'logchimp.config.json'))
    if (!configurationFile) {
      this.error('Working directory is not a recognisable LogChimp installation.')
    }

    // Skip asking question with --force flag
    if (!flags.force) {
      this.warn(
        'Running this command will delete all of your images, data, any files related to this LogChimp instance, and the contents of this folder!'
      )

      const confirm = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'delete',
          message: 'Are you sure you want to do this?',
          choices: ['yes', 'no'],
        },
      ])

      if (!confirm.delete) {
        return
      }
    }

    const tasks = new Listr([
      {
        title: 'Remove content folder',
        task: async () => {
          await fs.removeSync(path.join(currentDirectory, 'content'))
        },
      },
      {
        title: 'Remove configuration files',
        task: async () => {
          await fs.removeSync(path.join(currentDirectory, 'logchimp.config.json'))
        },
      },
      {
        title: 'Remove LogChimp instance',
        task: async () => {
          await fs.removeSync(path.join(currentDirectory))
        },
      },
    ])

    try {
      await tasks.run()
    } catch (error) {
      this.error(error)
    }
  }
}

UninstallCommand.description = `Remove a LogChimp instance and any related configuration files
`

UninstallCommand.flags = {
  force: flags.boolean({
    char: 'f',
    description: 'Skip delete confirmation',
    default: false,
  }),
}

module.exports = UninstallCommand
