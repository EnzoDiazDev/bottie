import "reflect-metadata";

export default function Extension(prefix = ""):ClassDecorator {
    return (target:any) => {
        Reflect.defineMetadata("prefix", prefix, target);
        if(!Reflect.hasMetadata("commands", target))
            Reflect.defineMetadata("commands", [], target);
    };
}
