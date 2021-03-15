const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "set-stacked-ranks",
            enabled: true,
            aliases: [ "setstacked-ranks", "setstacked", "set-stacked" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        if (!data.guild.stackedRanks){
            await this.client.database.updateGuildSetting(message.guild.id, {
                stackedRanks: true
            });
            return message.success("config/set-stacked-ranks:SUCCESS_ENABLED");
        } else {
            await this.client.database.updateGuildSetting(message.guild.id, {
                stackedRanks: false
            });
            return message.success("config/set-stacked-ranks:SUCCESS_DISABLED");
        }
    }
};
