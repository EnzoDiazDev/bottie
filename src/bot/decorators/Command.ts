import CommandDefinition from "../../utils/CommandDefinition";
import "reflect-metadata";

export default function Command(trigger:string|Array<string>, description?:string) {
    return (target, method_name) => {
        if(!Reflect.hasMetadata("commands", target.constructor))
            Reflect.defineMetadata("commands", [], target.constructor);

        const commands = Reflect.getMetadata("commands", target.constructor) as Array<CommandDefinition>;

        commands.push({
            trigger: trigger,
            description: description || "Description not provided.",
            method_name: method_name
        });

        Reflect.defineMetadata("commands", commands, target.constructor);
    };
}
