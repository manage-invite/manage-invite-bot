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

        if(!data.guild.premium){
            return message.channel.send(message.language.joinDM.premium(message.author.username));
        }
        
        if(!data.guild.joinDM.enabled){
            data.guild.joinDM.enabled = true;
            await data.guild.joinDM.updateData();
            return message.channel.send(message.language.setdmjoin.on());
        }
        if(data.guild.joinDM.enabled){
            data.guild.joinDM.enabled = false;
            await data.guild.joinDM.updateData();
            return message.channel.send(message.language.setdmjoin.off());
        }
    }
};
          
module.exports = SetDMJoin;