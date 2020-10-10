const {Listr} = require('listr2')

const setupPostgreSQL = () => {
  return new Listr([
    {
      title: 'Connecting to database',
      task: () => {}, // canConnect(dbConfig)
    },
    {
      title: 'Creating new PostgreSQL user',
      task: () => {}, // createUser(dbConfig)
    },
    {
      title: 'Granting new user permissions',
      task: () => {}, // grantPermissions(dbConfig)
    },
  ])
}

module.exports = setupPostgreSQL
