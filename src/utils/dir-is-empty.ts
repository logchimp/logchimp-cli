const fs = require('fs-extra');

const dirIsEmpty = (dir: string) => {
		const files = fs.readdirSync(dir);

    if (!files.length) {
			return true;
		} else {
			return false;
		}
};

module.exports = dirIsEmpty;
