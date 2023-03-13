const { GoalBlock } = require('mineflayer-pathfinder').goals;
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const config = require('config');

module.exports = {
	init: (bot) => {
		mineflayerViewer(bot, { port: config.get('options.viewer.port'), firstPerson: config.get('options.viewer.first-person') });
		bot.viewer.on('blockClicked', (block, face, button) => {
			if (button !== 2) return;

			const p = block.position.offset(0, 1, 0);

			bot.pathfinder.setGoal(new GoalBlock(p.x, p.y, p.z));
		});
		bot.on('path_update', (r) => {
			const path1 = [bot.entity.position.offset(0, 0.5, 0)];
			for (const node of r.path) {
				path1.push({ x: node.x, y: node.y + 0.5, z: node.z });
			}
			bot.viewer.drawLine('path', path1, 0xff00ff);
		});
	},
};