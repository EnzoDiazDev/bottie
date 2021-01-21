import {ClientEvents, Message} from "discord.js";

interface BotEvents extends ClientEvents {
    command:[string, Message, ...string[]]
}

export default BotEvents;
