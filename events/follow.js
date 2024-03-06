const { goals } = require('mineflayer-pathfinder');
const GoalFollow = goals.GoalFollow;
const utils = require('./../util');
const config = require('config');

function followPlayer(data) {
	// Get needed data out of data object
	const bot = data.bot;

	// change data object so that the correct targetedplayer is specified
	if (data.username == "console") {
        data.username = data.message[1]
    }
	data.targetedplayer = data.username;

	// Get targeted player or reset the event if player cant be found
	const returned = utils.getTargetedPlayer(data);
	if (!returned) { return { currentevent: 'default' };}
	const player = returned.player;

	// Create FollowGoal and assign to the bot
	const goal = new GoalFollow(player.entity, config.get('options.follow-distance'));
	bot.pathfinder.setGoal(goal, true);

	// Set the event and the targetedplayer.
	return {
		currentevent: 'default',
		targetedplayer: data.username,
	};
}

// Set the Keyword for the event and the initialisation code
module.exports = {
	keyword: 'follow',
	init: followPlayer,
};