const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const GoalFollow = goals.GoalFollow
const GoalNear = goals.GoalNear
const Vec3 = require('vec3')

var bot = null


function init() {
    bot = mineflayer.createBot({
        host: 'node2.vadoseship.co.uk',
        port: 25569,
        auth: 'microsoft',
        version: '1.18.2',
    })

    bot.loadPlugin(pathfinder)
    init2()
}


function getTargetedPlayer(){
    const player = bot.players[targetedplayer]
    if(!player || player.entity == null){
        currentevent = 0
        bot.chat(`/msg ${targetedplayer} I Cant See You`)
        return false
    }
    return player
}

function lookAtNearestPlayer () {
    const playerFilter = (entity) => entity.type === 'player'
    const playerEntity = bot.nearestEntity(playerFilter)
    
    if (!playerEntity) return
    
    const pos = playerEntity.position.offset(0, playerEntity.height, 0)
    bot.lookAt(pos)
}

function lookAtSpecificPlayer () {
    const player = getTargetedPlayer()
    if(!player) return

    const pos = player.entity.position.offset(0, player.entity.height, 0)
    bot.lookAt(pos)
}

function lookAtBlock () {
    const pos = new Vec3(targetedlocation[0], targetedlocation[1], targetedlocation[2])
    bot.lookAt(pos)
}

function autokill () {
    timer++
    if(timer > 20){
        timer = 0
        mob = bot.entityAtCursor()
        if(!mob) {
            bot.swingArm()
            return
        }
        bot.attack(mob)
    }
}

function followPlayer() {
    const player = getTargetedPlayer()
    if(!player) return

    const goal = new GoalFollow(player.entity, 3)
    bot.pathfinder.setGoal(goal, true)
}

function mountNearestBoat() {
    const boatFilter = (entity) => entity.type === 'other' && entity.mobType === 'Boat'
    const boatEntity = bot.nearestEntity(boatFilter)
    bot.mount(boatEntity)
}

async function dropall(){
    var inventoryItemCount = bot.inventory.items().length;
    if (inventoryItemCount === 0) return
    while (inventoryItemCount > 0) {
        const item = bot.inventory.items()[0]
        
        await bot.tossStack(item)
        inventoryItemCount--
    }
}




function reconnect() {
    try{
        console.log("reconnecting")
        init()
    } catch {
        console.log("failed to connect")
    }
}







function init2() {
    events = {
        0: lookAtNearestPlayer,
        1: lookAtSpecificPlayer,
        2: lookAtBlock,
        4: autokill
    }
    currentevent = 0
    targetedplayer = ""
    targetedlocation = [0, 0, 0]
    timer = 0
	
    var shouldreconnect = true
    
    function ExecuteTickEvent() {
        events[currentevent]()
    }

    bot.on('physicsTick', ExecuteTickEvent)

    bot.on('whisper', (username, message) => {
        message= message.split(" ")
        switch (message[0]) {
            case "look":
                targetedplayer = username
                bot.pathfinder.setGoal(null)
                currentevent = 1
                if(message.length = 4){
                    if(!isNaN(message[1]) && !isNaN(message[2]) && !isNaN(message[3])){
                        targetedlocation = [+message[1], +message[2], +message[3]]
                        currentevent = 2
                    }
                }
                break
            case "follow":
                targetedplayer = username
                currentevent = 0
                followPlayer()
                break
            case "goto":
                currentevent = 0
                if(message.length = 4){
                    if(!isNaN(message[1]) && !isNaN(message[2]) && !isNaN(message[3])){
                        targetedlocation = [+message[1], +message[2], +message[3]]
                        bot.pathfinder.setGoal(new GoalNear(targetedlocation[0], targetedlocation[1]+1, targetedlocation[2], 0))
                    }
                }
                break
            case "mount":
                targetedplayer = username
                currentevent = 0
                mountNearestBoat()
                break
            case "dismount":
                targetedplayer = username
                currentevent = 0
                bot.dismount()
                break
            case "stay":
                currentevent = 0
                bot.pathfinder.setGoal(null)
                break
            case "kill":
                currentevent = 4
                bot.pathfinder.setGoal(null)
                break
            case "dropall":
                targetedplayer = username
                dropall()
                break
            default:
                if (username == 'me' || username == bot.username) break;
                bot.chat(`/msg ${username} This is an automated reply, Please contact Vadoseship or Forester302. If you need to kick me include the word "AFK" in the kick reason.`)
                break
        }

    })

    bot.once('spawn', () => {
        const mcData = require('minecraft-data')(bot.version)
        const movements = new Movements(bot, mcData)
        mineflayerViewer(bot, { port: 8008, firstPerson: false })

        bot.pathfinder.setMovements(movements)
    })

    bot.on('kicked', (reason) => {
        console.log(`Kicked for ${JSON.parse(reason)["text"]}`)
        var keywords = ["banned", "Kicked from server", "lag", "afk", "Lag", "AFK", "LAG", "Banned", "Farm", "farm", "location"]
        if(str(reason) == 'undefined') return
        for(var word in keywords){
            if (JSON.parse(reason)["text"].indexOf(word)){
                console.log('Aborting Reconnect')
                shouldreconnect = false;
                break
            }
        }
    })

    bot.on('end', (reason) => {
        if (shouldreconnect){
        	setTimeout(reconnect, 10000)
        }
    })
}

init()