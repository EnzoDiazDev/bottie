import {Client, ClientOptions} from "discord.js";
import {bot_config, filter_function, prestart_function, handler_function} from "./utils/BotTypes";
import Bot from "./bot/Bot";

export default class Bottie {
    private bot:Bot

    constructor(config:bot_config, client_options?:ClientOptions) {
        this.bot = new Bot(config, client_options);
    }

    public get client():Client {
        return this.bot.client;
    }

    public set message_handler(message_handler:handler_function) {
        this.bot.set_message_handler = message_handler;
    }

    public get filter():filter_function {
        return this.bot.filter;
    }

    public set filter(filter:filter_function) {
        this.bot.set_filter = filter;
    }

    public set prestart(prestart:prestart_function) {
        this.bot.set_prestart = prestart;
    }

    public async start(token:string):Promise<void> {
        await this.bot.start(token);
    }
}
