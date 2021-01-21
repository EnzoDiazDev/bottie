import {Broker, EventChannel as OriginalEventChannel} from "@enzodiazdev/eventbroker";
import BotEvents from "./BotEvents";

export default class EventChannel<BotEvent extends keyof BotEvents> extends OriginalEventChannel<BotEvents, BotEvent> {
    readonly event_type:BotEvent

    constructor(event:BotEvent, broker:Broker<BotEvents>){
        super(broker);
        this.event_type = event;
    }

    /**
     * Override the notify_all() function
     */
    public set handle(fn:(...args:BotEvents[BotEvent]) => void){
        //@ts-expect-error - its a delegation.
        this.notify_all = fn;
    }
}
