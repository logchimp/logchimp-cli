const path = require('path')
const execa = require('execa')
const fs = require('fs-extra')

const CLI_PATH = path.resolve(__dirname, '..', '..', 'bin', 'run')
const runCommand = (args, options) => execa(CLI_PATH, args, options)

describe('config:set command', () => {
  beforeEach(async () => {
    // fail-safe: delete any existing logchimp config at root directory
    const currentDirectory = await process.cwd()
    await fs.removeSync(`${currentDirectory}/logchimp.config.json`)
  })

  it('config file missing error', async () => {
    const command = await runCommand(['config:set'])

    expect(command.stderr).toContain("Warning: Logchimp configuration file doesn't exist.")
  })

  it('--key & --value flag is missing', async () => {
    // generate config file
    await runCommand(['config:generate'])

    const command = await runCommand(['config:set'])

    expect(command.stderr).toContain('Warning: You have passed invalid key or value')
  })

  it("update 'secretkey' value", async () => {
    // generate config file
    await runCommand(['config:generate'])

    await runCommand(['config:set', '-k=secretkey', '-v=mySecretKey'])

    const currentDirectory = await process.cwd()
    const config = fs.readJsonSync(`${currentDirectory}/logchimp.config.json`)
    expect(config.secretkey).toBe('mySecretKey')
  })
})
