function mount(data) {
	const bot = data.bot;
	const message = data.message;

	let Filter = true;

	if (message.length == 2) {
		const mobType = message[1].charAt(0).toUpperCase() + message[1].slice(1);
		Filter = (entity) => entity.mobType === mobType;
	}
	else {
		Filter = (entity) => (entity.type === 'other' && (entity.mobType === 'Boat' || entity.mobType == 'Minecart')) ||
		entity.type === 'mob' && (entity.mobType == 'Horse' || entity.mobType == 'Donkey' || entity.mobType == 'Mule' ||
		entity.mobType == 'Llama');
	}
	const Entity = bot.nearestEntity(Filter);
	bot.mount(Entity);
}

module.exports = {
	keyword: 'mount',
	init: mount,
};