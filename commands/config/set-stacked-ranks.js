const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "set-stacked-ranks",
            enabled: true,
            aliases: [ "setstacked", "set-stacked" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        if (!data.guild.stackedRanks){
            await data.guild.setStackedRanks(true);
            return message.success("config/set-stacked-ranks:SUCCESS_ENABLED");
        }
        if (data.guild.stackedRanks){
            await data.guild.setStackedRanks(false);
            return message.success("config/set-stacked-ranks:SUCCESS_DISABLED");
        }
    }
};
