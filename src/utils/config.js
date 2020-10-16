const fs = require('fs-extra')
const _ = require('lodash')

class Config {
  /**
	 * Constructs the config instance
	 *
	 * @param {string} filename Filename to load
	 */
  constructor(filename) {
    if (!filename) {
      throw new Error('Config file not specified!')
    }

    this.file = filename
    this.values = Config.exists(this.file) || {}
  }

  get(key, defaultValue) {
    return _.get(this.values, key, defaultValue)
  }

  /**
	 * Sets a value in the config.
	 * If 'value' is null, removes the key from the config
	 *
	 * @param {Object} value Object to save in config file
	 * @returns {Class} Config instance
	 */
  set(value) {
    if (!value) {
      throw new Error('value not found')
    }

    Object.assign(this.values, value)
    return this
  }

  /**
	 * Saves the config file to disk
	 * @returns {Boolean} Return boolean after saving
	 */
  save() {
    fs.writeJSONSync(this.file, this.values, {spaces: 2})
    return true
  }

  /**
	 * Checks whether or not a config file exists
	 * @param {string} filename absolute path to config file
	 * @returns {object} return parsed json format data from config file
	 */
  static exists(filename) {
    try {
      const result = fs.readJsonSync(filename)
      return result
    } catch (error) {
      return false
    }
  }
}

module.exports = Config
