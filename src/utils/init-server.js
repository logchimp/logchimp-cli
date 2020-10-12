const execa = require('execa')

module.exports = config => {
  const server = config.get('server')
  const database = config.get('database')

  return [{
    title: 'Booting LogChimp Core',
    task: () => {
      const command = execa('node', ['server/app.js'], {
        env: {
          NODE_ENV: 'production',
          PORT: server.port,
          PG_PORT: database.port,
          PG_DATABASE: database.name,
          PG_HOST: database.host,
          PG_USER: database.user,
          PG_PASSWORD: database.password,
          PG_SSL: database.ssl ? true : '',
          SECRET_KEY: server.secretKey,
        },
      })

      command.catch(error => {
        this.error(error)
      })
    },
  }]
}
