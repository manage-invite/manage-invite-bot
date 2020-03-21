const Command = require("../../structures/Command.js");

class SetLeave extends Command {
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
            return message.channel.send(message.language.setleave.on());
        }
        if(data.guild.leave.enabled){
            data.guild.leave.enabled = false;
            await data.guild.leave.updateData();
            return message.channel.send(message.language.setleave.off());
        }
    }
};
          
module.exports = SetLeave;