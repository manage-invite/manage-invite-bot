const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setleave",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message) {
        const guildPlugins = await this.client.database.fetchGuildPlugins(message.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "leave")?.pluginData;

        if (!plugin?.enabled){
            await this.client.database.updateGuildPlugin(message.guild.id, "leave", {
                ...(plugin || {}),
                enabled: true
            });
            return message.success("config/setleave:ENABLED");
        }
        if (plugin.enabled){
            await this.client.database.updateGuildPlugin(message.guild.id, "leave", {
                ...plugin,
                enabled: false
            });
            return message.success("config/setleave:DISABLED");
        }
    }
};
