const Command = require("../../structures/Command.js");

class SetKeepRanks extends Command {
    constructor (client) {
        super(client, {
            name: "setkeep-ranks",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        if(!data.guild.premium) return message.channel.send(message.language.setkeepranks.premium(message.author.username));
        if(!data.guild.keepRanks){
            await data.guild.setKeepRanks(true);
            return message.channel.send(message.language.setkeepranks.on());
        }
        if(data.guild.keepRanks){
            await data.guild.setKeepRanks(false);
            return message.channel.send(message.language.setkeepranks.off());
        }
    }
};
          
module.exports = SetKeepRanks;