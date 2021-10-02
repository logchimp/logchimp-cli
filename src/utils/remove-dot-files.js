const fs = require('fs')
const fsExtra = require('fs-extra')

/**
 * Remove dot files from the directory
 * @param {string} directory current working directory
 * @returns {undefined}
 */
const removeDotFiles = (directory) => {
  fs.readdir(directory, (err, list) => {
    if (err) {
      return err
    }

    const dotFiles = list.filter((item) => {
      if (!item.split('.')[0]) {
        return item
      }

      return null
    })

    for (const dotFile of dotFiles) {
      fsExtra.removeSync(`${directory}/${dotFile}`)
    }
  })
}

module.exports = removeDotFiles
