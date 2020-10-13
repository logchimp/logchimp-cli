const execa = require('execa')

module.exports = () => {
  return [{
    title: 'Booting LogChimp Core',
    task: () => {
      const command = execa('node', ['server/app.js'], {
        env: {
          NODE_ENV: 'production',
        },
      })

      command.catch(error => {
        return error
      })
    },
  }]
}
