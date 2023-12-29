"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dgram = require("dgram");
const simple_voice_chat_1 = require("./simple_voice_chat");
class VoiceServer {
    constructor() {
        this.MAGIC_NUMBER = 255;
        this.udpSocket = dgram.createSocket('udp4');
        this.connected = false;
    }
    init(bot, data) {
        this.udpSocket.on("error", (err) => { throw new Error(`Failed to connect  to UDP server: ${err}`); });
        this.udpSocket.on("close", () => { console.log("UDP Connection closed"); });
        this.udpSocket.on("message", this.handler.bind(this));
        this.bot = bot;
        this.playerUUID = data.playerUUID;
        this.host = data.voiceHost.length > 0 ? new URL("voicechat://" + data.voiceHost).host : bot._client.socket.remoteAddress;
        this.port = data.voiceHost.length > 0 ? parseInt(new URL(this.host).port) : data.serverPort;
        this.secret = data.secret;
        simple_voice_chat_1.SVC_OBJ.PacketManager.secret = this.secret;
        this.send(simple_voice_chat_1.SVC_OBJ.PacketManager.createPacket("packet", {
            "id": "AuthenticatePacket",
            "data": {
                "playerUUID": this.playerUUID,
                "secret": this.secret
            }
        }));
    }
    handler(msg, _) {
        return __awaiter(this, void 0, void 0, function* () {
            const network_message = simple_voice_chat_1.SVC_OBJ.PacketManager.parsePacket("client_network_message", msg);
            if (network_message.data.magic_number != this.MAGIC_NUMBER) {
                return;
            }
            const payload = simple_voice_chat_1.SVC_OBJ.PacketManager.decrypt(network_message.data.payload);
            const packet = simple_voice_chat_1.SVC_OBJ.PacketManager.parsePacket("packet", payload);
            this.bot._client.emit(`SVC_${packet.data.id.replace("Packet", "")}`, (packet.data.data));
        });
    }
    send(payload) {
        const enc_payload = simple_voice_chat_1.SVC_OBJ.PacketManager.encrypt(payload);
        const network_message = simple_voice_chat_1.SVC_OBJ.PacketManager.createPacket("server_network_message", {
            "magic_number": this.MAGIC_NUMBER,
            "playerUUID": this.playerUUID,
            "payload": enc_payload
        });
        this.udpSocket.send(network_message, this.port, this.host);
    }
}
exports.default = VoiceServer;
