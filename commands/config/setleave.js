const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setleave",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        if(!data.guild.leave.enabled){
            data.guild.leave.enabled = true;
            await data.guild.leave.updateData();
            return message.success("config/setleave:ENABLED");
        }
        if(data.guild.leave.enabled){
            data.guild.leave.enabled = false;
            await data.guild.leave.updateData();
            return message.success("config/setleave:DISABLED");
        }
    }
};
