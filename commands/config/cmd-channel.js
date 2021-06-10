const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "cmd-channel",
            enabled: true,
            aliases: [ "cmdchannel" ],
            clientPermissions: [ "EMBED_LINKS", "MANAGE_MESSAGES" ],
            permLevel: 2
        });
    }

    async run (message) {
        if (message.mentions.channels.first()){
            await this.client.database.updateGuildSetting(message.guild.id, "cmdChannel", message.mentions.channels.first().id);
            message.success("config/cmd-channel:SUCCESS_ENABLED", {
                channel: message.mentions.channels.first().toString(),
                prefix: message.guild.settings.prefix
            });
        } else {
            if (message.guild.settings.cmdChannel){
                await this.client.database.updateGuildSetting(message.guild.id, "cmdChannel", null);
                message.success("config/cmd-channel:SUCCESS_DISABLED");
            } else {
                message.error("config/cmd-channel:MISSING_CHANNEL");
            }
        }
    }
};
