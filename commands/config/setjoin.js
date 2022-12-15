const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setjoin",
            enabled: true,
            clientPermissions: [ PermissionFlagsBits.EmbedLinks ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Enable or disable the join message"
            }
        });
    }

    async runInteraction (interaction) {
        const guildPlugins = await this.client.database.fetchGuildPlugins(interaction.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "join")?.pluginData;

        if (!plugin?.enabled){
            await this.client.database.updateGuildPlugin(interaction.guild.id, "join", {
                ...(plugin || {}),
                enabled: true
            });
            return interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/setjoin:ENABLED") });
        }
        if (plugin.enabled){
            await this.client.database.updateGuildPlugin(interaction.guild.id, "join", {
                ...plugin,
                enabled: false
            });
            return interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/setjoin:DISABLED") });
        }
    }
};
