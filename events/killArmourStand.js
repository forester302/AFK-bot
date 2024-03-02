const config = require('config');

function killArmorStand(data) {
	const bot = data.bot;
	let timer = data.timer;
	timer++;
	if (timer > config.get('options.raid-kill-timing')) {
		timer = 0;
		const armorstand = bot.nearestEntity(e => e.displayName === 'Armor Stand');
		if (!armorstand) {
			bot.swingArm();
			return { timer: timer };
		}
		bot.attack(armorstand);
	}
	return { timer: timer };
}

module.exports = {
	// set the id for this event and the code to be run every tick
	id: 'killArmourStand',
	execute: killArmorStand,

	// Set the Keyword for the event and the initialisation code
	keyword: 'raid',
	init: (data) => {
		data.bot.pathfinder.setGoal(null);
		return { currentevent: 'killArmourStand' };
	},
};