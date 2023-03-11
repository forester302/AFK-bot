function mount(data) {
	const bot = data.bot;
	const message = data.message;

	let Filter = true;
	let OtherFilter = true;

	if (message.length == 2) {
		const mobType = message[1].charAt(0).toUpperCase() + message[1].slice(1);
		Filter = (entity) => entity.mobType === mobType;
		OtherFilter = (entity) => entity.username == mobType;
	}
	else {
		Filter = (entity) => (entity.type === 'other' && (entity.mobType === 'Boat' || entity.mobType == 'Minecart')) ||
		entity.type === 'mob' && (entity.mobType == 'Horse' || entity.mobType == 'Donkey' || entity.mobType == 'Mule' ||
		entity.mobType == 'Llama');
	}
	let Entity = bot.nearestEntity(Filter);
	if (!Entity && message.length == 2) {
		Entity = bot.nearestEntity(OtherFilter);
	}
	if (!Entity) return;
	bot.mount(Entity);
}

module.exports = {
	keyword: 'mount',
	init: mount,
};