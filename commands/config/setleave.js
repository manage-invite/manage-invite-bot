const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setleave",
            enabled: true,
            clientPermissions: [ PermissionFlagsBits.EmbedLinks ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Enable or disable the leave message",
            }
        });
    }

    async runInteraction (interaction) {
        const guildPlugins = await this.client.database.fetchGuildPlugins(interaction.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "leave")?.pluginData;

        if (!plugin?.enabled){
            await this.client.database.updateGuildPlugin(interaction.guild.id, "leave", {
                ...(plugin || {}),
                enabled: true
            });
            return interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/setleave:ENABLED") });
        }
        if (plugin.enabled){
            await this.client.database.updateGuildPlugin(interaction.guild.id, "leave", {
                ...plugin,
                enabled: false
            });
            return interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/setleave:DISABLED") });
        }
    }
};
