module.exports = {
	keyword: 'inventory',
	init: (data) => {
		const message = data.message;
		const bot = data.bot;

		if (message.length == 3 && message[1] == 'offhand') {
			for (const item of bot.inventory.slots) {
				if (item != null && (item.displayName == message[2] || item.name == message[2])) {
					bot.equip(item, 'off-hand');
					break;
				}
			}
		}
		console.log(data.bot.inventory);
	},
};