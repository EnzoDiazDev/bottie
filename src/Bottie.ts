import {Client} from "discord.js";
import EventBroker from "./event_broker/EventBroker";
import BotProperties from "./BotProperties";
import BotEvents from "./event_broker/BotEvents";
import EventChannelFactory from "./event_broker/EventChannelFactory";
import EventChannel from "./event_broker/EventChannel";

export default class Bottie {
    readonly client:Client
    protected broker:EventBroker
    readonly properties:BotProperties
    protected command_match:RegExp

    constructor(properties:BotProperties){
        this.client = properties.discord_client || new Client();
        this.properties = properties;
        this.broker = properties.broker || new EventBroker(this.client);
        this.command_match = new RegExp(`${properties.prefix}\\s*`);
    }

    /**
     * Uses the `EventChannelFactory` to create new event channels.
     * @param event A bot event.
     */
    public new_EventChannel<BotEvent extends keyof BotEvents>(event:BotEvent):EventChannel<BotEvent>{
        return EventChannelFactory.create(event, this.broker);
    }

    /**
     * Add a default command handling.
     */
    public enable_command_handling():void {
        const message_channel = this.new_EventChannel("message");
        message_channel.handle = message => {
            if(message.content.startsWith(this.properties.prefix)){
                const content_lower = message.content.toLowerCase();

                // se retira el prefijo del mensaje
                const without_prefix = content_lower.replace(this.command_match, "");

                // se toma el comando
                const command_name = without_prefix.split(" ")[0];

                // se toman los argumentos
                const command_arguments = without_prefix.split(" ")
                    .slice(1) // se retira el comando
                    .filter(command_argument => command_argument !== "") // se filtran los argumentos vacios
                    .map(command_argument => command_argument.trim()); // se limpian los espacios al inicio y al final del string

                // emite el evento command
                this.emit("command", command_name, message, ...command_arguments);
            }

            // emite el evento message
            message_channel.suscriptors.forEach(suscriptor => suscriptor.notified(message));
        };

        this.on("message", message_channel);
    }

    /**
     * Set an event channel for a Bot event.
     * @param event A bot event.
     * @param channel A event channel for the event.
     */
    public on<BotEvent extends keyof BotEvents>(event:BotEvent, event_channel:EventChannel<BotEvent>):void {
        this.broker.on(event, event_channel);
    }

    /**
     * Broadcast an event to the Bot event channels.
     * @param event A bot Event.
     * @param args The event arguments.
     */
    public emit<BotEvent extends keyof BotEvents>(event:BotEvent, ...args:BotEvents[BotEvent]):void {
        this.broker.emit(event, ...args);
    }

    /**
     * Procedure before starting the bot.
     */
    private _prestart = async ():Promise<void> => {
        console.info("starting...");
    }

    /**
     * Sets the prestart function.
     */
    set prestart (fn:()=>Promise<void>){
        this._prestart = fn;
    }

    /**
     * Starts the Bot.
     * @param token Token provided by Discord
     * @see https://discord.com/developers/applications Discord Developer Portal
     */
    public async start(token:string):Promise<void> {
        await this._prestart();
        this.client.login(token);
    }
}
