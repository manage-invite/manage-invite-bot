const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "set-keep-ranks",
            enabled: true,
            aliases: [ "setkeep-ranks", "setkeep", "set-keep" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        if (!data.guild.keepRanks){
            await data.guild.setKeepRanks(true);
            return message.success("config/setkeep-ranks:SUCCESS_ENABLED");
        } else {
            await data.guild.setKeepRanks(false);
            return message.success("config/setkeep-ranks:SUCCESS_DISABLED");
        }
    }
};
