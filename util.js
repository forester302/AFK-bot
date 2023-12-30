function getTargetedPlayer(data) {
	const bot = data.bot;
	const targetedplayer = data.targetedplayer;
	const player = bot.players[targetedplayer];
	if (!player || player.entity == null) {
		bot.chat(`/msg ${targetedplayer} I Cant See You`);
		return false;
	}
	return { player: player };
}

module.exports = {
	getTargetedPlayer: getTargetedPlayer,
};