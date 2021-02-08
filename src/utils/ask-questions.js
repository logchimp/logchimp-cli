const inquirer = require('inquirer')
const omgopass = require('omgopass')
const _ = require('lodash')

const askQuestions = async () => {
  // generate random password
  const generatePassword = omgopass({
    minSyllableLength: 12,
  })

  const generateConfig = await inquirer.prompt([
    // server
    {
      type: 'confirm',
      name: 'local',
      message: 'Run LogChimp for local development/testing',
      choices: ['false', 'true'],
      default: false,
    },
    {
      type: 'input',
      name: 'server.port',
      message: 'Server port to listen on',
      default: 3000,
      validate: answer => {
        // Check port is not empty and is number
        const isNumber = !isNaN(answer)
        if (answer !== '') if (isNumber) return true

        return 'Please enter a correct server port'
      },
    },
    {
      type: 'input',
      name: 'server.secretkey',
      message: 'Secret key for password validation (default to auto-generate random secret key)',
      filter: answer => {
        // Return auto generated secretKey on empty answer
        if (answer === '') return generatePassword
        return answer
      },
    },

    // database
    {
      type: 'input',
      name: 'database.name',
      message: 'Database name',
      validate: answer => {
        if (_.isString(answer) && answer) {
          return true
        }
        return 'Please enter a valid database name'
      },
    },
    {
      type: 'input',
      name: 'database.host',
      message: 'Database host',
      validate: answer => {
        const isString = isNaN(answer)

        // Warn for special characters
        const removeSpecialCharacters = answer.match(/[^.\w\s-]/gi)
        if (!_.isEmpty(removeSpecialCharacters)) return 'Special characters are not supported'

        if (isString) return true
      },
    },
    {
      type: 'input',
      name: 'database.port',
      message: 'Database port',
      default: 5432,
      validate: answer => {
        // Check port is not empty and is number
        const isNumber = !isNaN(answer)
        if (answer !== '') if (isNumber) return true

        return 'Please enter a correct database port'
      },
    },
    {
      type: 'input',
      name: 'database.user',
      message: 'Database username',
      validate: answer => {
        if (_.isString(answer) && answer) {
          return true
        }
        return 'Please enter a valid database username'
      },
    },
    {
      type: 'input',
      name: 'database.password',
      message: 'Database password (default auto-generate random password)',
      filter: answer => {
        // Return auto generated password on empty answer
        if (answer === '') return generatePassword
        return answer
      },
    },
    {
      type: 'confirm',
      name: 'database.ssl',
      message: 'Enable SSL for database',
      choices: ['true', 'false'],
    },

    // mail
    {
      type: 'input',
      name: 'mail.service',
      message: 'Select a mail service of your choice',
      validate: answer => {
        if (_.isString(answer) && answer) {
          return true
        }
        return 'Please enter a valid mail service name'
      },
    },
    {
      type: 'input',
      name: 'mail.host',
      message: 'Mail hostname',
      validate: answer => {
        const isString = isNaN(answer)

        // Warn for special characters
        const removeSpecialCharacters = answer.match(/[^.\w\s-]/gi)
        if (!_.isEmpty(removeSpecialCharacters)) return 'Special characters are not supported'

        if (isString) return true
      },
    },
    {
      type: 'input',
      name: 'mail.port',
      message: 'Mail port',
      default: 587,
      validate: answer => {
        // Check port is not empty and is number
        const isNumber = !isNaN(answer)
        if (answer !== '') if (isNumber) return true

        return 'Please enter a correct mail port'
      },
    },
    {
      type: 'input',
      name: 'mail.username',
      message: 'Mail username',
      validate: answer => {
        if (_.isString(answer) && answer) {
          return true
        }
        return 'Please enter a valid mail username'
      },
    },
    {
      type: 'input',
      name: 'mail.password',
      message: 'Mail password (default auto-generate random password)',
      filter: answer => {
        // Return auto generated password on empty answer
        if (answer === '') return generatePassword
        return answer
      },
    },
  ])

  return generateConfig
}

module.exports = askQuestions
