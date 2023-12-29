"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = void 0;
const simple_voice_chat_1 = require("./simple_voice_chat");
function plugin(bot) {
    // @ts-ignore
    bot.simple_voice_chat = {};
    (0, simple_voice_chat_1.init)(bot);
    bot.simple_voice_chat.sendUDP = (payload) => {
        simple_voice_chat_1.SVC_OBJ.VoiceServer.send(payload);
    };
    bot.simple_voice_chat.sendPCM = (pcm, whispering = false) => {
        bot.simple_voice_chat.sendUDP(simple_voice_chat_1.SVC_OBJ.PacketManager.protoDef.createPacketBuffer("packet", {
            "id": "MicPacket",
            "data": {
                "data": pcm,
                "sequencenumber": process.hrtime.bigint(),
                "whispering": whispering
            }
        }));
    };
    bot.simple_voice_chat.joinGroup = (group, password = "") => {
        bot._client.write("custom_payload", { channel: "voicechat:set_group", data: simple_voice_chat_1.SVC_OBJ.PacketManager.createPacket("set_group", {
                "uuid": group,
                "password": password.length > 0 ? password : undefined
            }) });
    };
    bot.simple_voice_chat.joinGroupName = (groupname, password = "") => {
        for (const group of simple_voice_chat_1.SVC_Data.groups) {
            if (group[1].name == groupname) {
                bot.simple_voice_chat.joinGroup(group[0], group[1].hasPassword ? password : "");
                return;
            }
        }
    };
    bot.simple_voice_chat.leaveGroup = () => {
        bot._client.write("custom_payload", { channel: "voicechat:leave_group", data: Buffer.from([]) });
    };
    bot.simple_voice_chat.protodef = simple_voice_chat_1.SVC_OBJ.PacketManager.protoDef;
    bot.simple_voice_chat.data = simple_voice_chat_1.SVC_Data;
    bot.simple_voice_chat.AudioPlayer = simple_voice_chat_1.SVC_OBJ.AudioPlayer;
}
exports.plugin = plugin;
