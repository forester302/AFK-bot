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
const opus_1 = require("@discordjs/opus");
const sleep = ms => new Promise((resolve) => setTimeout(resolve, ms));
const fs = require("fs");
const path = require("path");
//@ts-ignore
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");
const simple_voice_chat_1 = require("./simple_voice_chat");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
class AudioPlayer {
    constructor() {
        this.SAMPLE_RATE = 48000;
        this.CHANNELS = 2;
        this.initialised = false;
        this.queue = [];
        this.shouldLoop = false;
        this.queueRunning = false;
        this.songPlaying = false;
        this.shouldStopQueue = false;
        this.shouldStopSong = false;
        this.paused = false;
    }
    init(bot) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialised)
                return;
            this.bot = bot;
            const directory = "pcm";
            for (const file of yield fs.promises.readdir(directory)) {
                yield fs.promises.unlink(path.join(directory, file));
            }
            this.initialised = true;
            bot.emit("audio_player_initialised");
        });
    }
    //Will add YT/Spotify Downloading in the future
    //Will work like this
    //Request song
    //song gets downloded
    //song gets converted to PCM buffer (2 channels 48000Hz)
    //downloaded song gets deleted (if exists)
    //song gets stored in file and file name gets added to queue
    //When song finished playing
    //If queue not loop song file gets deleted
    //On startup clear out directory
    enQueue(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialised)
                return;
            if (!fs.existsSync(`audio/${file}`)) {
                return false;
            }
            if (!fs.existsSync(`pcm/${file}.pcm`)) {
                //Convert to PCM
                let pcmBuffer = yield new Promise((resolve, reject) => {
                    let chunks = [];
                    const ffmpegCommand = ffmpeg(`audio/${file}`)
                        .audioCodec('pcm_s16le')
                        .format('s16le')
                        .audioFilters(`atempo=${1.0.toFixed(1)}`)
                        .audioChannels(this.CHANNELS)
                        .audioFrequency(this.SAMPLE_RATE)
                        .on("error", reject);
                    const audioStream = ffmpegCommand.pipe();
                    audioStream.on("data", (chunk) => {
                        chunks.push(chunk);
                    });
                    audioStream.on('end', () => {
                        let outputBuffer = Buffer.concat(chunks);
                        resolve(outputBuffer);
                    });
                });
                //Store PCM in file
                yield fs.promises.writeFile(`pcm/${file}.pcm`, pcmBuffer);
            }
            this.queue.push(`pcm/${file}.pcm`);
            this.bot.emit("audioplayer_enqueue");
            this.runQueue();
        });
    }
    deQueue() {
        return this.queue.shift();
    }
    runQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialised)
                return;
            if (this.queueRunning)
                return;
            this.queueRunning = true;
            while (!this.shouldStopQueue) {
                if (!this.songPlaying && this.queue.length > 0 && simple_voice_chat_1.SVC_OBJ.VoiceServer.connected) {
                    let song = this.deQueue();
                    console.log(song);
                    this.sendPCM(song);
                }
                yield sleep(5);
            }
            this.queueRunning = false;
            this.shouldStopQueue = false;
        });
    }
    sendPCM(file) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bot.emit("audioplayer_song_start");
            const pcmBuffer = fs.promises.readFile(file);
            const opusEncoder = new opus_1.OpusEncoder(this.SAMPLE_RATE, this.CHANNELS);
            const frameSize = (this.SAMPLE_RATE / 1000) * 40 * this.CHANNELS;
            frameDelay = BigInt(20500000);
            this.songPlaying = true;
            const frames = [];
            for (let i = 0; i < (yield pcmBuffer).length; i += frameSize) {
                while (this.paused) {
                    if (this.shouldStopSong) {
                        break;
                    }
                    yield sleep(1);
                }
                if (this.shouldStopSong) {
                    break;
                }
                const startTime = process.hrtime.bigint();
                //cut frame out
                const frame = (yield pcmBuffer).subarray(i, i + frameSize);
                if (frame.length !== frameSize) {
                    break;
                }
                const opus = opusEncoder.encode(frame);
                this.bot.simple_voice_chat.sendPCM(opus);
                const endTime = process.hrtime.bigint();
                const elapsedTime = endTime - startTime;
                const sleepTime = frameDelay - elapsedTime;
                if (sleepTime > 0) {
                    yield sleep(Number(sleepTime) / 1000000);
                }
                else {
                    console.log("Took too long");
                }
            }
            console.log("song finished");
            this.shouldStopSong = false;
            this.paused = false;
            this.songPlaying = false;
            if (this.shouldLoop) {
                this.queue.push(file);
            }
            this.bot.emit("audioplayer_song_end");
        });
    }
    stop() {
        this.shouldStopQueue = true;
        this.shouldStopSong = true;
        this.bot.once("audioplayer_song_end", () => {
            this.bot.emit("audioplayer_stop");
        });
    }
    pause() {
        this.paused = true;
        this.bot.emit("audioplayer_pause");
    }
    play() {
        this.paused = false;
        this.bot.emit("audioplayer_play");
    }
    skip() {
        this.shouldStopSong = true;
        this.bot.once("audioplayer_song_end", () => {
            this.bot.emit("audioplayer_skip");
        });
    }
    setQueueLoop(shouldLoop) {
        this.shouldLoop = shouldLoop;
    }
}
exports.default = AudioPlayer;
/*
Throw event when
music starts,
music stops,
music succesfully paused,
music succesfully played,
music succesfully skipped,
item added to the queue,
*/ 
