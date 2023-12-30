function music(data) {
	const bot = data.bot
	const message = data.message
	switch (message[1]) {
		case ("stop"):
			bot.simple_voice_chat.AudioPlayer.stop()
			break
		case ("pause"):
			bot.simple_voice_chat.AudioPlayer.pause()
			break
		case ("play"):
			bot.simple_voice_chat.AudioPlayer.play()
			break
		case ("skip"):
			bot.simple_voice_chat.AudioPlayer.skip()
			break
		case ("loop"):
			bot.simple_voice_chat.AudioPlayer.setQueueLoop(message.split(" ")[1] == "on")
			break
		case ("join"):
			let submessage = message.slice(2).join(" ")
			submessage = submessage.split(" pass:")
			groupname = submessage[0].replace("group:", "")
			password = submessage.length == 2 ? submessage[1] : undefined
			bot.simple_voice_chat.joinGroupName(groupname, password)
			break
		case ("leave"):
			bot.simple_voice_chat.leaveGroup()
			break
		default:
			bot.simple_voice_chat.AudioPlayer.enQueue(message[1])
	}
}



module.exports = {
	keyword: 'music',
	init: music,
};