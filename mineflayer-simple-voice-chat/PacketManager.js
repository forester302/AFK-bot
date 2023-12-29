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
//import crypto from "crypto";
const protodef_1 = require("protodef");
const crypto = require("crypto");
const protocol_1 = require("./data/protocol");
class PacketManager {
    constructor() {
        this.protoDef = new protodef_1.ProtoDef(false);
    }
    init(bot) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bot = bot;
            this.protoDef.addProtocol(protocol_1.default, ["channels"]);
            this.protoDef.addProtocol(protocol_1.default, ["udp"]);
            this.protoDef.addTypes(protocol_1.default.types);
            this.bot.on("login", () => __awaiter(this, void 0, void 0, function* () {
                this.registerChannels(this.bot._client);
                this.registerTypes(this.bot._client);
            }));
        });
    }
    init_udp() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    registerChannels(client) {
        return __awaiter(this, void 0, void 0, function* () {
            client.registerChannel("voicechat:secret", this.protoDef.types.secret, true);
            client.registerChannel("voicechat:player_state", this.protoDef.types.player_state, true);
            client.registerChannel("voicechat:player_states", this.protoDef.types.player_states, true);
            client.registerChannel("voicechat:add_group", this.protoDef.types.add_group, true);
            client.registerChannel("voicechat:remove_group", this.protoDef.types.remove_group, true);
        });
    }
    // Is there a better way to do this?
    registerTypes(client) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [key, value] of Object.entries(this.protoDef.types)) {
                client.registerChannel(key, value);
            }
        });
    }
    parsePacket(packet_type, packet) {
        return this.protoDef.parsePacketBuffer(packet_type, packet);
    }
    createPacket(packet_type, packet) {
        return this.protoDef.createPacketBuffer(packet_type, packet);
    }
    encrypt(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-128-cbc', this.secret, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        return Buffer.concat([iv, encrypted]);
    }
    decrypt(payloadArray) {
        const payload = Buffer.from(payloadArray);
        const iv = payload.subarray(0, 16);
        const encryptedData = payload.subarray(16, payload.length);
        const decipher = crypto.createDecipheriv('aes-128-cbc', this.secret, iv);
        const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
        return decryptedData;
    }
}
exports.default = PacketManager;
