const fs = require('fs-extra')

const validateConfig = configFile => {
  try {
    return fs.readJSONSync(configFile)
  } catch (error) {
    return false
  }
}

module.exports = validateConfig
