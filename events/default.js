function lookAtNearestPlayer(data) {
	// Get needed data out of data object
	const bot = data.bot;

	// Get nearest player
	const playerFilter = (entity) => entity.type === 'player';
	const playerEntity = bot.nearestEntity(playerFilter);

	if (!playerEntity) return;

	// Look at players Head
	const pos = playerEntity.position.offset(0, playerEntity.height, 0);
	bot.lookAt(pos);
}


module.exports = {
	// set the id for this event and the code to be run every tick
	id: 'default',
	execute: lookAtNearestPlayer,

	// Set the Keyword for the event and the initialisation code
	keyword: 'stay',
	init: (data) => {
		data.bot.pathfinder.setGoal(null);
		return { currentevent: 'default' };
	},
};