Abstracción de la librería Discord.js. Base para desarrollo de bots en discord, totalmente orientado a objetos.

---

Este programa se encuentra escrito en Typescript, corriendo sobre NodeJS, totalmente orientado a objetos. 

Como librería principal se ha seleccionado la más utilizada, Discord.JS, la cual provee total control sobre la API de Discord.com y se encuentra actualizada a la última versión de ésta. 

Para el funcionamiento de los comandos y la reacción a eventos del cliente se ha optado por una arquitectura dirigida a eventos gracias a la alta escalabilidad y separación de responsabilidades que provee. 

En cuanto a la persistencia de la información, se envía y recibe peticiones a una API externa, principalmente la de FaztCommunity.com. 

La filosofía del programa es sencilla: <br>
todo evento ocurre de manera asíncrona, sin interés en el orden en el que ocurran, sin necesidad que ocurra una respuesta positiva y totalmente tolerable a fallos, deficiencias o carencias.

## Event Driven

Cuando el cliente de Discord.JS (el productor) emite un evento, este viaja al broker del sistema, quien básicamente es un reemisor del evento.
*Nota: En la versión alpha, el propio **bot** actúa como broker*.

Al broker se le añaden canales y a estos se le añaden suscriptores, según los requerimientos.<br>Los canales transmiten un único tipo de evento, los suscriptores solo pueden reaccionar a un único tipo de evento y, por ende, un suscriptor puede suscribirse a un canal de su mismo tipo de evento.<br>
Los eventos se encuentran definidos por los propios del Client de Discord.js, con algunos eventos añadidos.<br>
Para mas detalles: [BotEvents](...)

Los canales son similares a los observers del patrón Observer; métodos para añadir y retirar suscriptores, una lista de suscriptores y un método para notificarles a todos el evento ocurrido.<br>
Su responsabilidad es reemitir los eventos del Client de Discord.js, pudiendo o no añadirles información adicional.<br>
*Nota: En la versión alpha, los canales no tienen una cola de eventos.*

Para efectos prácticos, un suscriptor podría comunicarse con el canal e inclusive con el productor, según la propia implementación del canal de eventos.<br>
Esta libertad debe ser utilizada con mucha cautela, además documentarse y advertirse adecuadamente.<br>
Idealmente, tanto los suscriptores como los emisores deberían conocer poco o nada del otro.<br>

Esta arquitectura permite eliminar el desarrollo mediante callbacks nativo de EventEmitter, ofreciendo así una alternativa orientada a objetos que permite explotar las ventajas de typescript y su encapsulamiento.

#### Aclaración de conceptos

Tanto en el contexto de Discord como en el de la arquitectura, existe el concepto de Canal y de Mensaje, por lo que de ahora en más: 

* Canal: Se refiere a un canal de eventos de la arquitectura (Event Channel). 
* Mensaje: Se refiere a un mensaje de chat de Discord.

### EventChannel

> Los canales son similares a los observers del patrón Observer; métodos para añadir y retirar suscriptores, una lista de suscriptores y un método para notificarles a todos el evento ocurrido.<br>
> Su responsabilidad es reemitir los eventos [...]<br>

No deberían contener mucha lógica de negocio, más allá de aquello que garantice y enriquezca el evento.

![](https://i.imgur.com/Z1HXDro.png)

### Suscriptores

Un suscriptor es un procesador de eventos de un canal.<br>
Al recibir una orden, se ejecutará y hará cualquier cosa según se especifiquen los requerimientos.<br>
Los suscriptores deberán ser tolerable a fallos, lanzando errores según corresponda.<br>
Los errores no deben alterar el funcionamiento de ninguna otra parte del sistema, y se deben crear procedimientos de respaldo siempre que sea posible.<br>
Es ideal que no se produzca ningún efecto en el sistema o en sistemas conectados hasta que no se haya completado el 100% de la tarea.

Cada suscriptor podría ser considerado un minisistema, su independencia o bajo acoplamiento es crucial para poder escalar su complejidad, sin alterar el funcionamiento normal del programa.<br>
Si bien no todos los suscriptores tienen por qué ser complejos, aquellos que lo sean requieren de su propia documentación.<br>
Bajo ninguna circunstancia el programa debe fallar por una dependencia de un comando.

> Para efectos prácticos, un suscriptor podría comunicarse con el canal e inclusive con el productor [...]<br>
> Esta libertad debe ser utilizada con mucha cautela, además documentarse y advertirse adecuadamente.<br>
> Tanto los suscriptores como los emisores deben conocer poco o nada del otro.<br>

![](https://i.imgur.com/cXNNJ63.png)

### Flujo Productor-Suscriptor

![](https://i.imgur.com/r1Cdibm.png)

* El broker escucha un evento cualquiera emitido por el productor.
* El broker selecciona un canal del mismo tipo de evento y llama al método `notify_all()`, pasando los argumentos del evento original.
* El channel llama al método `notified()` de todos los suscriptores.

## Comandos

Los comandos son la esencia y el motivo del programa. <br>
Estos responden a los requerimientos y casos de uso del proyecto y se ejecutan según sus reglas. 

Básicamente un comando es un suscriptor de tipo `command`. Es una clase abstracta que extiende de la clase Suscriptor, y llama al método abstracto `executed` de manera transparente para la clase concreta (el comando en sí). 

Como suscriptores, deberán ser tolerable a fallos, emitiendo un error según el tipo de actor: Si el actor es el propio sistema se debe emitir una alerta al sistema de monitoreo. Si el actor es un usuario, se debe contestar mediante Discord al usuario que ha cometido un error. Ambos casos pueden ocurrir simultáneamente. 

Unos ejemplos de la versión 0.0.2:

![](https://i.imgur.com/4sSfQCj.png)

#### Implementación de un comando básico

![](https://i.imgur.com/RiewOC7.png)

#### Flujo de ejecución de un comando básico

![](https://i.imgur.com/BcMQPiK.png)

## Creación de comandos

Todo el desarrollo del programa se basa en la creación de nuevos comandos.

1. Crea un archivo.
2. Exporta por defecto una clase llamada igual que el archivo.
3. Importa la clase abstracta Command
4. Haz que la clase extienda a Command e implementa los miembros abstractos.
5. En el método `executed` colocas la lógica del comando.
6. Si lo es, llama a un método de ejecución. 

Fuera de eso, la clase en sí es implementada sin reglas concretas más allá de las del proyecto.<br>
Si la clase depende de otras, las instancias de éstas deberán ser inyectadas mediante setters a la hora de suscribir el observer al observable. 

Es posible conocer al canal que ha emitido el comando accediendo a `this.channel`, aunque debe ser usado en casos muy especificos.

Si el comando tiene propiedades editables, el método opcional `configured` debe ser implementado y debe proveer la capacidad de editar esas propiedades.

Los métodos pueden reutilizar condiciones o funcionalidades mediante decoradores. 

Ejemplo más básico de un comando: 

```typescript
export default class Ping extends Command {
    readonly name = "ping"
    readonly description = "Responde con pong!"
    
    protected executed(message:Message):void { //Los argumentos (...args:string[]) son opcionales
        message.channel.send("pong!");
    }
}
```

## Comunicación entre comandos

Aunque desde cualquier parte puede llamarse al método `configured` de un comando, es normal que se sea la acción de un usuario la que cambie el estado de una funcionalidad (comando), mediante otro comando. 

Ignorando los privilegios del autor del mensaje y la implementación concreta del comando, el flujo de comunicación se ve así.

![](https://i.imgur.com/eWs5zVP.png)

Cada clase se encarga de comprobar si el evento le pertenece, si la nueva configuración es compatible consigo misma y de notificar los cambios. 

Ejemplo simplificado:

```typescript
export default class CommandA extends Command {
  readonly name = "commanda"
  readonly description = "command a things!"
  
  protected executed(message:Message, command, key, value):void { //command, key y value son tomados del parametro `...args`
      const config = {}
      config[key] = value

      if(this.channel){
          this.channel.configure_command(command, message.channel, config)
      }
  }
}
```

```typescript
export default class CommandB extends Command {
    readonly name = "commandb"
    readonly description = "command b things!"
    private enabled = true
    private category = "example"

    protected extecuted(message:Message){
        //command b things...
    }

    public configured(command_name:string, text_channel:TextChannel, config:object):void {
        if(this.is_for_this(command_name)){
            if(config.enabled !== undefined){
                this.enabled = config.enabled;
                channel.send(`Este comando ha sido ${this.enabled ? "" : "des"}habilitado`);
            }
            if(config.category !== undefined){
                channel.send(`No se puede cambiar la categoría de este comando`);
            }
            //se ignoran todas las demás propiedades que puedan haber
        }
    }
}
```
