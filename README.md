
# Minecraft AFK Bot

While running creates a permanently online Bot account that takes instruction from online players through private messages.




## Installation

1. Install [NodeJS](https://nodejs.org/en/)
1. [Download source code from GitHub](https://github.com/forester302/AFK-bot/archive/refs/heads/master.zip)
1. Configure default.json in the config folder
1. run `node index.js` in terminal to start
1. Follow instructions in terminal about logging into your microsoft account

    
## Run

 `node index.js`


## Commands

All commands sent via a pm (/msg or /whisper) to the bot

- **stay** - Sets the bot to the default state it is in and clears the pathfinder
- **follow** - Makes the bot follow a player
- **goto** - Make the bot Pathfind to a block within 100 blocks of its current location
    - `goto x y z`
- **kill** - Attack the entity that the bot is looking at (basically an autoclicker)
- **raid** - Attack the nearest Armor Stand (Used for certain raid farms)
- **look** - Look at player or block
    - `look` - Look at the player who sent command
    - `look x y z` - Look at specific block coordinates
    - `look yaw pitch` - Look in a specific direction
- **mount** - Mounts nearest rideable entity
    - `mount entity` - mount a specific entity type
    - `mount player` - mounts a specific player
- **sneak** - Makes the bot sneak
- **dismount** - Dismounts entity
- **dropall** - Drops the bots inventory
- **music** - Plays music through Simple Voice Chat
    - `music stop` - Stops all music playing
    - `music pause` - Pauses current song
    - `music play` - Resumes playing paused song
    - `music skip` - Skips current song
    - `music loop on/off` - Turns looping on and off
    - `music join group:<group> pass:<pass>` - join a group using the given groupname and password
    - `music leave` - Leaves a group if in one
    - `music <songfile>` - plays the specified music file in the audio folder


## Authors

- [@forester302](https://www.github.com/forester302)


## Contributors

- [@darxit](https://www.github.com/darxit)

