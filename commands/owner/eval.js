const Command = require("../../structures/Command.js");
module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "eval",
            enabled: true,
            aliases: [ "execute" ],
            clientPermissions: [],
            permLevel: 5
        });
    }

    async run (message) {

        const content = message.content.split(" ").slice(1).join(" ");
        const result = new Promise((resolve) => resolve(eval(content)));
        
        return result.then((output) => {
            if (typeof output !== "string"){
                output = require("util").inspect(output, { depth: 0 });
            }
            if (output.includes(this.client.token)){
                output = output.replace(this.client.token, "T0K3N");
            }
            message.channel.send(output, {
                code: "js"
            });
        }).catch((err) => {
            err = err.toString();
            if (err.includes(this.client.token)){
                err = err.replace(this.client.token, "T0K3N");
            }
            message.channel.send(err, {
                code: "js"
            });
        });

    }
};
