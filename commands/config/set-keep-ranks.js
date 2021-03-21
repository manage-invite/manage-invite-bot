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

    async run (message) {

        if (!message.guild.settings.keepRanks){
            await this.client.database.updateGuildSetting(message.guild.id, {
                keepRanks: true
            });
            return message.success("config/set-keep-ranks:SUCCESS_ENABLED");
        } else {
            await this.client.database.updateGuildSetting(message.guild.id, {
                keepRanks: false
            });
            return message.success("config/set-keep-ranks:SUCCESS_DISABLED");
        }
    }
};
