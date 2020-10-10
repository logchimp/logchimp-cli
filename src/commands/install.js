const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const decompress = require('decompress')
const {Listr} = require('listr2')
const {Observable} = require('rxjs')
const execa = require('execa')

// utils
const dirIsEmpty = require('../utils/dir-is-empty')
const removeDotFiles = require('../utils/remove-dot-files')
const yarn = require('../utils/yarn')

class InstallCommand extends Command {
  async run() {
    const currentDirectory = await process.cwd()

    // Check if the directory is empty
    if (!dirIsEmpty(currentDirectory)) {
      this.error('Current directory is not empty, LogChimp cannot be installed here.')
      return
    }

    const {flags} = this.parse(InstallCommand)

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

              // If command is `logchimp install --local` do a local install for development and testing
              // remove all dot files and folder if not local
              if (!flags.local) {
                await removeDotFiles(currentDirectory)
              }
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

InstallCommand.flags = {
  local: flags.boolean({
    description: 'Best for local development/testing',
    default: false,
  }),
}

InstallCommand.usage = ['install [flags]']

InstallCommand.examples = [
  '$ logchimp install',
  '$ logchimp install --local',
]

module.exports = InstallCommand
