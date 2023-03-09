async function dropall(data) {
	const bot = data.bot;

	let inventoryItemCount = bot.inventory.items().length;
	if (inventoryItemCount === 0) return;
	while (inventoryItemCount > 0) {
		const item = bot.inventory.items()[0];
		await bot.tossStack(item);
		inventoryItemCount--;
	}
}

module.exports = {
	keyword: 'dropall',
	init: dropall,
};