const { goals } = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');
const GoalNear = goals.GoalNear;

function goto(data) {
	const message = data.message;
	const bot = data.bot;
	if (message.length == 4) {
		if (!isNaN(message[1]) && !isNaN(message[2]) && !isNaN(message[3])) {
			const targetedlocation = [+message[1], +message[2], +message[3]];

			if ((bot.entity.position.distanceTo(new Vec3(targetedlocation[0], targetedlocation[1], targetedlocation[2]))) >= 100) return { currentevent:'default' };

			bot.pathfinder.setGoal(new GoalNear(targetedlocation[0], targetedlocation[1] + 1, targetedlocation[2], 0));
			return {
				currentevent:'default',
				targetedlocation: targetedlocation,
			};
		}
	}
	return { currentevent:'default' };
}

module.exports = {
	keyword: 'goto',
	init: goto,
};