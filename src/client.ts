import * as fs from 'fs';
import * as ytdl from'ytdl-core';
import * as ffmpeg from'ffmpeg';
import * as uniqueId from 'uniqid';

export default class Client {
  constructor(bot) {

    this.bot = bot;
    this.bot.onText(/\/start/, (msg) => this.start(msg));
    this.bot.onText(/https:/, (msg) => this.convert(msg));
  }

  private bot: any

  static async build(bot) {
    return new this(bot);
  }

  async start(msg) {
    return this.bot.sendMessage(msg.chat.id, 'Отправь мне ссылку на YouTube видео и я верну тебе аудио дорожу с него 😎');
  }

  async convert(msg) {
    try {
      const name = uniqueId();
      const id = await ytdl.getURLVideoID(msg.text);
      const {videoDetails: {title, lengthSeconds}} = await ytdl.getInfo(id);

      if (Number(lengthSeconds) > 600) return this.bot.sendMessage(msg.chat.id, 'Извини но видео слишком длинное 🥺');
      await this.bot.sendMessage(msg.chat.id, 'Погоди несколько секунд, обробатываю твой запрос 😉')
      const video = await ytdl(msg.text).pipe(fs.createWriteStream(`src/video/${name}.mp4`));
      video.on('finish', async () => {
        const process = await new ffmpeg(`src/video/${name}.mp4`);
        await process.fnExtractSoundToMP3(`src/sound/${name}.mp3`);
        fs.unlink(`src/video/${name}.mp4`,()=>{});
        await this.bot.sendAudio(msg.chat.id, `src/sound/${name}.mp3`, {}, { filename: title});
        fs.unlink(`src/sound/${name}.mp3`,()=>{});
        return this.bot.sendMessage(msg.chat.id, 'Что дальше? 😃 ');
      });
    } catch (error) {
      return this.bot.sendMessage(msg.chat.id, 'Видео не найдено 🤔');
    }
  }
}
