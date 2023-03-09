function look(data) {
	// Get needed data out of data object
	const username = data.username;
	const message = data.message;
	const bot = data.bot;

	const targetedplayer = username;

	// Reset pathfinder
	bot.pathfinder.setGoal(null);

	// Set currentevent
	let currentevent = 'lookAtPlayer';

	// If message continues with coordinates then change currentevent to look at a block
	if (message.length == 4) {
		if (!isNaN(message[1]) && !isNaN(message[2]) && !isNaN(message[3])) {
			const targetedlocation = [+message[1], +message[2], +message[3]];
			currentevent = 'lookAtBlock';

			// Return neccersary data
			return {
				'currentevent': currentevent,
				'targetedlocation': targetedlocation,
			};
		}
	}

	// Return neccersary data
	return {
		'currentevent': currentevent,
		'targetedplayer': targetedplayer,
	};
}

module.exports = {
	keyword: 'look',
	init: look,
};