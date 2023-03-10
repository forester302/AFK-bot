const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalBlock } = require('mineflayer-pathfinder').goals;
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const config = require('config');

let bot = null;


function init() {
	bot = mineflayer.createBot({
		host: config.get('server.host'),
		port: config.get('server.port'),
		auth: config.get('auth.type'),
		version: config.get('server.version'),
	});

	bot.loadPlugin(pathfinder);
	init2();
}

function reconnect() {
	try {
		console.log('reconnecting');
		init();
	}
	catch {
		console.log('failed to connect');
	}
}


function init2() {

	const events = {

	};
	const keywords = {

	};
	let currentevent = 'default';
	let targetedplayer = '';
	let targetedlocation = [0, 0, 0];
	// eslint-disable-next-line no-unused-vars, prefer-const
	let timer = 0;

	let shouldreconnect = config.get('options.autoreconnect');

	const fs = require('node:fs');
	const path = require('node:path');

	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		let valid = false;
		if ('id' in event && 'execute' in event) {
			events[event.id] = event.execute;
			valid = true;
		}
		if ('keyword' in event && 'init' in event) {
			keywords[event.keyword] = event.init;
			valid = true;
		}
		if (!valid) {
			console.log(`${filePath} is invalid`);
		}
	}
	console.log(events);

	function ExecuteTickEvent() {
		const dict = events[currentevent]({
			bot: bot,
			targetedplayer: targetedplayer,
			targetedlocation: targetedlocation,
			timer: timer,
		});

		if (typeof dict == 'undefined') return;
		if ('currentevent' in dict) {
			currentevent = dict.currentevent;
		}
		if ('targetedlocation' in dict) {
			targetedlocation = dict.targetedlocation;
		}
		if ('targetedplayer' in dict) {
			targetedplayer = dict.targetedplayer;
		}
		if ('timer' in dict) {
			timer = dict.timer;
		}
	}

	bot.on('physicsTick', ExecuteTickEvent);

	bot.on('whisper', (username, message) => {
		if (username == 'me' || username == bot.username) return;
		message = message.split(' ');
		if (message[0] in keywords) {
			const dict = keywords[message[0]]({
				bot: bot,
				username: username,
				message: message,
				targetedplayer: targetedplayer,
				targetedlocation: targetedlocation,
				timer: timer,
			});

			if (typeof dict == 'undefined') return;
			if ('currentevent' in dict) {
				currentevent = dict.currentevent;
			}
			if ('targetedlocation' in dict) {
				targetedlocation = dict.targetedlocation;
			}
			if ('targetedplayer' in dict) {
				targetedplayer = dict.targetedplayer;
			}
		}
		else {
			bot.chat(`/msg ${username} ${config.get('options.reply-message')}`);
		}
	});


	bot.once('spawn', () => {
		const mcData = require('minecraft-data')(bot.version);
		const movements = new Movements(bot, mcData);
		bot.pathfinder.setMovements(movements);

		if (config.get('options.viewer.enabled')) {
			mineflayerViewer(bot, { port: config.get('options.viewer.port'), firstPerson: config.get('options.viewer.first-person') });
			bot.viewer.on('blockClicked', (block, face, button) => {
				if (button !== 2) return;

				const p = block.position.offset(0, 1, 0);

				bot.pathfinder.setGoal(new GoalBlock(p.x, p.y, p.z));
			});
			bot.on('path_update', (r) => {
				const nodesPerTick = (r.visitedNodes * 50 / r.time).toFixed(2);
				console.log(`I can get there in ${r.path.length} moves. Computation took ${r.time.toFixed(2)} ms (${nodesPerTick} nodes/tick). ${r.status}`);
				const path1 = [bot.entity.position.offset(0, 0.5, 0)];
				for (const node of r.path) {
					path1.push({ x: node.x, y: node.y + 0.5, z: node.z });
				}
				bot.viewer.drawLine('path', path1, 0xff00ff);
			});
		}

		if (config.get('options.afk.on-join')) {
			bot.chat(config.get('options.afk.command'));
		}
	});

	bot.on('kicked', (reason) => {
		console.log(`Kicked for ${JSON.parse(reason)['text']}`);
		const kickkeywords = ['banned', 'Kicked from', 'lag', 'afk', 'Lag', 'AFK', 'LAG', 'Banned', 'Farm', 'farm', 'location'];
		if (String(reason) == 'undefined') return;
		for (const word in kickkeywords) {
			if (JSON.parse(reason)['text'].indexOf(word)) {
				console.log('Aborting Reconnect');
				shouldreconnect = false;
				break;
			}
		}
	});

	// eslint-disable-next-line no-unused-vars
	bot.on('end', (reason) => {
		if (shouldreconnect) {
			setTimeout(reconnect, 10000);
		}
	});
}

init();
