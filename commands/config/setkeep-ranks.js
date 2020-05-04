const Command = require("../../structures/Command.js");

module.exports = class extends Command {
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
        if(!data.guild.premium) return message.error("config/setkeep-ranks:SUCCESS_DISABLED", {
            username: message.author.username
        });
        if(!data.guild.keepRanks){
            await data.guild.setKeepRanks(true);
            return message.success("config/setkeep-ranks:SUCCESS_ENABLED");
        }
        if(data.guild.keepRanks){
            await data.guild.setKeepRanks(false);
            return message.success("config/setkeep-ranks:SUCCESS_DISABLED");
        }
    }
};
