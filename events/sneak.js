module.exports = {
	keyword: 'sneak',
	init: (data) => {
    	data.bot.setControlState('sneak', true)
    },
};