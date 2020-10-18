import { Message } from "discord.js";

export type bot_config = {
    prefix:string
}

export type filter_function = (message:Message) => Promise<boolean>

export type prestart_function = (message?:Message) => Promise<void>

export type handler_function = (message:Message) => Promise<void>
