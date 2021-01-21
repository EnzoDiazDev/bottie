import {Suscriptor as OriginalSuscriptor} from "@enzodiazdev/eventbroker";
import BotEvents from "./BotEvents";

export default abstract class Suscriptor<BotEvent extends keyof BotEvents> extends OriginalSuscriptor<BotEvents, BotEvent> {}
