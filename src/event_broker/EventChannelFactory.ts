import {Broker} from "@enzodiazdev/eventbroker";
import BotEvents from "./BotEvents";
import EventChannel from "./EventChannel";

export default class EventChannelFactory {
    private broker:Broker<BotEvents> | undefined;
    constructor(broker?:Broker<BotEvents>){
        this.broker = broker;
    }

    /**
     * Creates a new event channel
     * @param event A bot Event
     * @param broker A eventbroker
     */
    public static create<BotEvent extends keyof BotEvents>(event:BotEvent, broker:Broker<BotEvents>):EventChannel<BotEvent> {
        return new class extends EventChannel<typeof event>{}(event, broker);
    }

    /**
     * Creates a new event channel
     * @param event A bot Event
     * @param broker A optional eventbroker. *If not provided, the factory eventbroker will be used*
     */
    public create<BotEvent extends keyof BotEvents>(event:BotEvent, broker?:Broker<BotEvents>):EventChannel<BotEvent> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        if(!broker && !self.broker){
            throw new Error("You must provide a broker to the factory or to the 'create()' method");
        }

        // @ts-expect-error - One of these is defined by considering the conditional above.
        return new class extends EventChannel<typeof event>{}(event, broker || self.broker);
    }
}
