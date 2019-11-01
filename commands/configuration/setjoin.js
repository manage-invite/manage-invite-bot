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
            data.guild.markModified("join");
            await data.guild.save();
            return message.channel.send(`**${this.client.config.emojis.success} | The join system is now __ENABLED__ !**`);
        }
        if(data.guild.join.enabled){
            data.guild.join.enabled = false;
            data.guild.markModified("join");
            await data.guild.save();
            return message.channel.send(`**${this.client.config.emojis.success} | The join system is __DISABLED__ !**`);
        }
    }
};
          
module.exports = SetJoin;