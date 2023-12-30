const utils = require('./../util');

function lookAtSpecificPlayer(data) {
	// Get required data out of data object
	const bot = data.bot;

	// Get targeted player or reset the event if player cant be found
	const returned = utils.getTargetedPlayer(data);
	if (!returned) { return { currentevent: 'default' };}
	const player = returned.player;

	// Look at players Head
	const pos = player.entity.position.offset(0, player.entity.height, 0);
	bot.lookAt(pos);
}

// set the id for this event and the code to be run every tick
module.exports = {
	id: 'lookAtPlayer',
	execute: lookAtSpecificPlayer,
};