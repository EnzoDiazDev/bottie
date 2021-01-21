import { Client } from "discord.js";
import EventBroker from "event_broker/EventBroker";

interface BotProperties {
    prefix:string
    broker?:EventBroker;
    discord_client?:Client;
}

export default BotProperties;
