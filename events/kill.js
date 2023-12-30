const config = require('config');

function autokill(data) {
	const bot = data.bot;
	let timer = data.timer;

	timer++;
	if (timer > config.get('options.kill-timing')) {
		timer = 0;
		const mob = bot.entityAtCursor();
		if (!mob) {
			bot.swingArm();
			return { timer: timer };
		}
		bot.attack(mob);
	}
	return { timer: timer };
}

module.exports = {
	// set the id for this event and the code to be run every tick
	id: 'autokill',
	execute: autokill,

	// Set the Keyword for the event and the initialisation code
	keyword: 'kill',
	init: (data) => {
		data.bot.pathfinder.setGoal(null);
		return { currentevent: 'autokill' };
	},
};