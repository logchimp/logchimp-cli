const execa = require('execa');
const { Observable } = require('rxjs');

/**
 * Run a yarn command for installing all the packages
 *
 * @param Array yarnArgs
 */
const yarn = yarnArgs => {
	const command = execa("yarn", yarnArgs);

	return new Observable(subscribe => {
		const onData = data => subscribe.next(data.replace(/\n$/, ''));

		command.stdout.setEncoding("utf8");
		command.stdout.on("data", onData);

		command.then(() => {
			subscribe.complete();
		}).catch(error => {
			console.log(error);
		});
	})
}

module.exports = yarn;
