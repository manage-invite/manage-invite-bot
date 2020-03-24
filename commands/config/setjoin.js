const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setjoin",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        if(!data.guild.join.enabled){
            data.guild.join.enabled = true;
            await data.guild.join.updateData();
            return message.success("config/setjoin:ENABLED");
        }
        if(data.guild.join.enabled){
            data.guild.join.enabled = false;
            await data.guild.join.updateData();
            return message.success("config/setjoin:DISABLED");
        }
    }
};
