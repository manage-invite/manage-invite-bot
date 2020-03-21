const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class SetJoin extends Command {
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
            return message.channel.send(message.language.setjoin.on());
        }
        if(data.guild.join.enabled){
            data.guild.join.enabled = false;
            await data.guild.join.updateData();
            return message.channel.send(message.language.setjoin.off());
        }
    }
};
          
module.exports = SetJoin;