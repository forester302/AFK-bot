function dismount(data) {
	const bot = data.bot;
	bot.dismount();
}

module.exports = {
	keyword: 'dismount',
	init: dismount,
};