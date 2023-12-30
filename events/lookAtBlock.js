const Vec3 = require('vec3');


function lookAtBlock(data) {
	// Get required data out of data object
	const bot = data.bot;
	const targetedlocation = data.targetedlocation;

	// Look at location
	const pos = new Vec3(targetedlocation[0], targetedlocation[1], targetedlocation[2]);
	bot.lookAt(pos);
}

// set the id for this event and the code to be run every tick
module.exports = {
	id: 'lookAtBlock',
	execute: lookAtBlock,
};