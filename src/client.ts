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
    return this.bot.sendMessage(msg.chat.id, 'Отправь мне имя пользователя или ссылку на его профиль');
  }

  async convert(msg) {
    try {
      const name = uniqueId();
      const id = await ytdl.getURLVideoID(msg.text);
      const {videoDetails: {title, lengthSeconds}} = await ytdl.getInfo(id);

      if (Number(lengthSeconds) > 600) return this.bot.sendMessage(msg.chat.id, 'Извините но видео слишком длинное');
      const video = await ytdl(msg.text).pipe(fs.createWriteStream(`src/video/${name}.mp4`));
      video.on('finish', async () => {
        const process = await new ffmpeg(`src/video/${name}.mp4`);
        await process.fnExtractSoundToMP3(`src/sound/${name}.mp3`);
        fs.unlink(`src/video/${name}.mp4`,()=>{});
        await this.bot.sendAudio(msg.chat.id, `src/sound/${name}.mp3`, {}, { filename: title});
        return fs.unlink(`src/sound/${name}.mp3`,()=>{});
      });
    } catch (error) {
      return this.bot.sendMessage(msg.chat.id, 'Видео не найдено');
    }
  }
}
