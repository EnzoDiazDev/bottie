import { Client, ClientOptions, Message } from "discord.js";
import {bot_config, filter_function, prestart_function, handler_function} from "../utils/BotTypes";

export default class Bot {
    public client:Client

    constructor(config:bot_config, client_options?:ClientOptions) {
        this.client = new Client(client_options);
        this.client.on("message", message => this.message_handler(message));
    }

    public filter:filter_function = async () => true
    public set set_filter(filter:filter_function) {
        this.filter = filter;
    }

    private async message_handler(message:Message):Promise<void> {
        const passed = await this.filter(message);
        if(!passed) return;

        console.log("HANDLER", message.content);
    }
    public set set_message_handler(message_handler:handler_function){
        this.message_handler = message_handler;
    }

    // public commander(message:Message):void {
    //
    // }

    private prestart:prestart_function = async () => {/*void*/}
    public set set_prestart(prestart:prestart_function) {
        this.prestart = prestart;
    }

    public async start(token:string):Promise<void> {
        if(!token) throw new Error("Bot Token is not defined");
        await this.prestart();

        this.client.login(token);
    }
}
