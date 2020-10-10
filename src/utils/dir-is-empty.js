const fs = require('fs-extra')

/**
 * Present working directory in terminal
 * @param {string} dir current working directory
 * @returns {boolean} ture
 */
const dirIsEmpty = dir => {
  const files = fs.readdirSync(dir)

  if (!files.length()) {
    return true
  }
}

module.exports = dirIsEmpty
