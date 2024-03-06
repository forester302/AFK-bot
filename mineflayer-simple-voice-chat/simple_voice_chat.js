"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.SVC_OBJ = exports.SVC_Data = void 0;
//types
const PacketManager_1 = require("./PacketManager");
const VoiceServer_1 = require("./VoiceServer");
const AudioPlayer_1 = require("./AudioPlayer");
class SVC_Data {
}
exports.SVC_Data = SVC_Data;
class SVC_OBJ {
}
exports.SVC_OBJ = SVC_OBJ;
SVC_OBJ.VoiceServer = new VoiceServer_1.default();
function init(bot) {
    //Init
    SVC_OBJ.PacketManager = new PacketManager_1.default();
    SVC_OBJ.PacketManager.init(bot);
    SVC_OBJ.AudioPlayer = new AudioPlayer_1.default();
    SVC_OBJ.AudioPlayer.init(bot);
    SVC_Data.groups = new Map();
    SVC_Data.players = new Map();
    bot.on("spawn", () => {
        bot._client.write("custom_payload", { channel: "voicechat:request_secret", data: SVC_OBJ.PacketManager.createPacket("request_secret", { "version": 18 }) });
    });
    //Message Channels
    bot._client.on("voicechat:secret", (packet) => {
        SVC_OBJ.VoiceServer = new VoiceServer_1.default();
        SVC_OBJ.VoiceServer.init(bot, packet);
    });
    bot._client.on("voicechat:player_state", (packet) => {
        if (SVC_Data.players.has(packet.player_state.uuid)) {
            SVC_Data.players.delete(packet.player_state.uuid);
        }
        if (packet.player_state.disconnected) {
            return;
        }
        SVC_Data.players.set(packet.player_state.uuid, packet.player_state);
    });
    bot._client.on("voicechat:player_states", (packet) => {
        SVC_Data.players = new Map();
        for (let player of packet.player_states) {
            if (player.disconnected) {
                continue;
            }
            SVC_Data.players.set(player.uuid, player);
        }
    });
    bot._client.on("voicechat:add_group", (packet) => {
        if (SVC_Data.groups.has(packet.group.id)) {
            SVC_Data.groups.delete(packet.group.id);
        }
        SVC_Data.groups.set(packet.group.id, packet.group);
    });
    bot._client.on("voicechat:remove_group", (packet) => {
        SVC_Data.groups.delete(packet.uuid);
    });
    //UDP Server
    bot._client.on("SVC_AuthenticateAck", (data) => {
        SVC_OBJ.VoiceServer.send(SVC_OBJ.PacketManager.createPacket("packet", {
            "id": "ConnectionCheckPacket",
            "data": {}
        }));
    });
    bot._client.on("SVC_ConnectionCheckAck", (data) => {
        SVC_OBJ.VoiceServer.connected = true;
        bot.emit("voicechat_connected");
    });
    bot._client.on("SVC_Ping", (data) => {
        SVC_OBJ.VoiceServer.send(SVC_OBJ.PacketManager.createPacket("packet", {
            "id": "PingPacket",
            "data": {}
        }));
    });
    bot._client.on("SVC_KeepAlive", (data) => {
        SVC_OBJ.VoiceServer.send(SVC_OBJ.PacketManager.createPacket("packet", {
            "id": "KeepAlivePacket",
            "data": {}
        }));
    });
    bot._client.on("SVC_PlayerSound", (data) => {
        bot.emit("voicechat_sound", (data));
    });
    bot._client.on("SVC_GroupSound", (data) => {
        bot.emit("voicechat_sound", (data));
    });
    bot._client.on("SVC_LocationSound", (data) => {
        bot.emit("voicechat_sound", (data));
    });
}
exports.init = init;
