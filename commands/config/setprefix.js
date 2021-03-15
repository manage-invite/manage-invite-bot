const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setprefix",
            enabled: true,
            aliases: [ "configprefix" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        const prefix = args[0];
        if (!prefix) return message.error("config/setprefix:MISSING");
        await this.client.database.updateGuildSetting(message.guild.id, {
            prefix
        });
        message.success("config/setprefix:SUCCESS");
    }
};
