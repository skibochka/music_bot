import * as TelegramBot from 'node-telegram-bot-api';
import Client from './client';

class Bot {
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot('1423199531:AAFgPOUi1HKr9SSbhc0C1YOw8RQKDy5SLEo', {polling: true});
  }

  public start() {
    return Client.build(this.bot);
  }


}

new Bot().start();
