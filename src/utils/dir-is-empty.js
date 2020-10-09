const fs = require('fs-extra');

/**
 * Present working directory in terminal
 *
 * @param string dir
 */
const dirIsEmpty = dir => {
	const files = fs.readdirSync(dir);

	if (!files.length) {
		return true;
	} else {
		return false;
	}
};

module.exports = dirIsEmpty;
