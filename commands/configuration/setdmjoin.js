const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class SetDMJoin extends Command {
    constructor (client) {
        super(client, {
            name: "setdmjoin",
            enabled: true,
            aliases: [ "setdm" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        if(!data.guild.joinDM.enabled){
            data.guild.joinDM.enabled = true;
            data.guild.markModified("joinDM");
            await data.guild.save();
            return message.channel.send(`**${this.client.config.emojis.success} | The DM join system is now __ENABLED__ !**`);
        }
        if(data.guild.joinDM.enabled){
            data.guild.joinDM.enabled = false;
            data.guild.markModified("joinDM");
            await data.guild.save();
            return message.channel.send(`**${this.client.config.emojis.success} | The DM join system is __DISABLED__ !**`);
        }
    }
};
          
module.exports = SetDMJoin;