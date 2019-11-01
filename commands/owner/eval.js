const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

const clean = (txt) => {
    if (typeof(txt) === "string") return txt.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    return txt;   
};

class Eval extends Command {
    constructor (client) {
        super(client, {
            name: "eval",
            enabled: true,
            aliases: [ "execute" ],
            clientPermissions: [],
            permLevel: 4
        });
    }

    async run (message, args, data) {

        const content = message.content.split(" ").slice(1).join(" ");
        const result = new Promise((resolve, reject) => resolve(eval(content)));
        
        return result.then((output) => {
            if(typeof output !== "string"){
                output = require("util").inspect(output, { depth: 0 });
            }
            if(output.includes(message.client.token)){
                output = output.replace(message.client.token, "T0K3N");
            }
            message.channel.send(output, {
                code: "js"
            });
        }).catch((err) => {
            err = err.toString();
            if(err.includes(message.client.token)){
                err = err.replace(message.client.token, "T0K3N");
            }
            message.channel.send(err, {
                code: "js"
            });
        });

    }
};

module.exports = Eval;