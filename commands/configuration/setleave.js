const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

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
            data.guild.markModified("leave");
            await data.guild.save();
            return message.channel.send(`**${this.client.config.emojis.success} | The leave system is now __ENABLED__ !**`);
        }
        if(data.guild.leave.enabled){
            data.guild.leave.enabled = false;
            data.guild.markModified("leave");
            await data.guild.save();
            return message.channel.send(`**${this.client.config.emojis.success} | The leave system is __DISABLED__ !**`);
        }
    }
};
          
module.exports = SetLeave;