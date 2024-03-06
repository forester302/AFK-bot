//Add mineflayer-simple-voice-chat from github.com/forester302/mineflayer-simple-voice-chat to the directory

const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const autoeat = require('mineflayer-auto-eat').plugin;
const simple_voice_chat = require('./mineflayer-simple-voice-chat').plugin;
const config = require('config');
//const webserver = require('./webserver');

// define global variables
let bot = null;

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
let restart = false;


function initbot() {
	bot = mineflayer.createBot({
		host: config.get('server.host'),
		port: config.get('server.port'),
		auth: config.get('auth.type'),
		version: config.get('server.version'),
	});

	bot.loadPlugin(pathfinder);

	bot.loadPlugin(autoeat);

	if (config.get('options.music.enabled')) {
		bot.loadPlugin(simple_voice_chat);
	}

	//if (config.get('options.webui.enabled')) {
	//	webserver.init(events, keywords, bot);
	//}
}

function reconnect() {
	try {
		console.log('reconnecting');
		if (config.get('options.viewer.enabled')) {
			bot.viewer.close();
		}
		startbot();
	}
	catch {
		console.log('failed to connect');
	}
}


function initEvents() {
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
}

function parsereturn(dict) {
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
	if ('trigger' in dict) {
		parsereturn(keywords[dict.trigger]({
			bot: bot,
			username: dict.username,
			message: dict.message,
			targetedplayer: targetedplayer,
			targetedlocation: targetedlocation,
			timer: timer,
		}))
	}
}

function startbot() {
	initbot();

	bot.on('physicsTick', () => {
		let dict = webserver.tick({
			bot: bot,
			targetedplayer: targetedplayer,
			targetedlocation: targetedlocation,
			timer: timer
		});
		parsereturn(dict);
		dict = events[currentevent]({
			bot: bot,
			targetedplayer: targetedplayer,
			targetedlocation: targetedlocation,
			timer: timer,
		});
		parsereturn(dict);
	});

	bot.on('whisper', (username, message) => {
		if (username == 'me' || username == bot.username) return;
		message = message.split(' ');
		//Add ability to reload events without restarting the bot
		if (message[0] == "reload") {
			initEvents()
			console.log("Reloaded Events")
			return
		}
		if (message[0] in keywords) {
			if (!config.get("options.commanding-players").includes(username)) {
				bot.chat(`/msg ${username} ${config.get("options.no-permissions-message")}`)
				return;
			}
			const dict = keywords[message[0]]({
				bot: bot,
				username: username,
				message: message,
				targetedplayer: targetedplayer,
				targetedlocation: targetedlocation,
				timer: timer,
			});
			parsereturn(dict);
		}
		else {
			bot.chat(`/msg ${username} ${config.get('options.reply-message')}`);
		}
	});


	bot.once('spawn', () => {

		restart = false;

		const mcData = require('minecraft-data')(bot.version);
		const movements = new Movements(bot, mcData);
		bot.pathfinder.setMovements(movements);

		bot.autoEat.options.useOffhand = true;

		if (config.get('options.viewer.enabled')) {
			require('./functions/viewer').init(bot);
		}

		if (config.get('options.afk.on-join')) {
			bot.chat(config.get('options.afk.command'));
		}
	});

	bot.on('kicked', (reason) => {
		console.log(`Kicked for ${JSON.parse(reason)['text']}`);
		const kickkeywords = ['banned', 'lag', 'afk', 'Lag', 'AFK', 'LAG', 'Banned', 'Farm', 'farm', 'location'];
		if (String(reason) == 'undefined') return;
		for (const word of kickkeywords) {
			if (JSON.parse(reason)['text'].includes(word)) {
				console.log('Aborting Reconnect');
				shouldreconnect = false;
				break;
			}
		}
	});

	bot.on('kicked', (reason) => {
		console.log(`Kicked for ${JSON.parse(reason)['text']}`);
		const reconnectkeywords = ['Server is restarting', 'restart', 'restarting', 'Restarting Server', 'Server closed'];
		if (String(reason) == 'undefined') return;
		for (const word of reconnectkeywords) {
			if (JSON.parse(reason)['text'].includes(word)) {
				console.log('Server is restarting, waiting 5 minutes')
				shouldreconnect = false;
				restart = true;
				break;
			}
		}
	});

	// eslint-disable-next-line no-unused-vars
	bot.on('end', (reason) => {
		if (shouldreconnect) {
			setTimeout(reconnect, 10000);
		}
		if (restart) {
			setTimeout(reconnect, 300000);
			console.log('i made it here, waiting 5 minutes');
		}
	});
}

async function asyncConsole() {
    const readline = require('readline');

    const readLineAsync = () => {
      const rl = readline.createInterface({
        input: process.stdin
      });

      return new Promise((resolve) => {
        rl.prompt();
        rl.on('line', (line) => {
          rl.close();
          resolve(line);
        });
      });
    };
    
    while (true) {
        let message = (await readLineAsync()).split(' ');
        console.log(message)
        if (message[0] in keywords) {
			const dict = keywords[message[0]]({
				bot: bot,
				username: "console",
				message: message,
				targetedplayer: targetedplayer,
				targetedlocation: targetedlocation,
				timer: timer,
			});
			parsereturn(dict);
		}
		else {
			console.log(`${config.get('options.reply-message')}`);
		}
    }
}

asyncConsole()

initEvents();
startbot()