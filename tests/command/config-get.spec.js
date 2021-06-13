const path = require('path')
const execa = require('execa')
const fs = require('fs-extra')

const CLI_PATH = path.resolve(__dirname, '..', '..', 'bin', 'run')
const runCommand = (args, options) => execa(CLI_PATH, args, options)

describe('config:get command', () => {
  beforeEach(async () => {
    // fail-safe: delete any existing logchimp config at root directory
    const currentDirectory = await process.cwd()
    await fs.removeSync(`${currentDirectory}/logchimp.config.json`)
  })

  it('config file missing error', async () => {
    const command = await runCommand(['config:get'])

    expect(command.stderr).toContain('Warning: Logchimp configuration file doesn\'t exist.')
  })

  it('--key flag is missing', async () => {
    // generate config file
    await runCommand(['config:generate'])

    const command = await runCommand(['config:get'])

    expect(command.stdout).toContain(
      'Pass the --key flag to get the value',
    )
  })

  it('get \'database.port\' value', async () => {
    // generate config file
    await runCommand(['config:generate'])

    const command = await runCommand(['config:get', '-k=database.port'])

    expect(command.stdout).toBe('5432')
  })
})
