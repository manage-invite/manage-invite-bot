const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "config",
            enabled: true,
            aliases: [ "conf", "configuration" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Displays the current configuration of the bot."
            }
        });
    }

    async runInteraction (interaction, data) {

        const plugins = await this.client.database.fetchGuildPlugins(interaction.guild.id);

        const join = plugins.find((plugin) => plugin.pluginName === "join")?.pluginData;
        const joinDM = plugins.find((plugin) => plugin.pluginName === "joinDM")?.pluginData;
        const leave = plugins.find((plugin) => plugin.pluginName === "leave")?.pluginData;

        const joinSuccess = join?.enabled
        && join?.mainMessage
        && join?.channel
        && interaction.guild.channels.cache.get(join?.channel);

        const joinDMSuccess = joinDM?.enabled
        && joinDM?.mainMessage;

        const leaveSuccess = leave?.enabled
        && leave?.mainMessage
        && leave?.channel
        && interaction.guild.channels.cache.get(leave?.channel);

        const getEmoji = (boolean) => boolean ? Constants.Emojis.SUCCESS : Constants.Emojis.ERROR;

        const embed = new Discord.MessageEmbed()
            .setTitle(interaction.guild.translate("config/config:TITLE", {
                guild: interaction.guild.name
            }))
            .addField(interaction.guild.translate("config/config:JOIN_TITLE", {
                status: getEmoji(joinSuccess)
            }), interaction.guild.translate("config/config:JOIN_CONTENT", {
                enabled: join?.enabled ? `**${interaction.guild.translate("common:YES").toLowerCase()}**` : `**${interaction.guild.translate("common:NO").toLowerCase()}**`,
                message: join?.mainMessage ? `**${interaction.guild.translate("common:DEFINED").toLowerCase()}**` : `**${interaction.guild.translate("common:NOT_DEFINED").toLowerCase()}**`,
                channel: join?.channel ? (interaction.guild.channels.cache.get(join?.channel) ? `<#${join.channel}>` : interaction.guild.translate("config/config:CHANNEL_NOT_FOUND")) : `**${interaction.guild.translate("common:NOT_DEFINED").toLowerCase()}**`
            }), true)
            .addField(interaction.guild.translate("config/config:LEAVE_TITLE", {
                status: getEmoji(leaveSuccess)
            }), interaction.guild.translate("config/config:JOIN_CONTENT", {
                enabled: leave?.enabled ? `**${interaction.guild.translate("common:YES").toLowerCase()}**` : `**${interaction.guild.translate("common:NO").toLowerCase()}**`,
                message: leave?.mainMessage ? `**${interaction.guild.translate("common:DEFINED").toLowerCase()}**` : `**${interaction.guild.translate("common:NOT_DEFINED").toLowerCase()}**`,
                channel: leave?.channel ? (interaction.guild.channels.cache.get(leave?.channel) ? `<#${leave.channel}>` : interaction.guild.translate("config/config:CHANNEL_NOT_FOUND")) : `**${interaction.guild.translate("common:NOT_DEFINED").toLowerCase()}**`
            }), true)
            .addField(interaction.guild.translate("config/config:JOIN_DM_TITLE", {
                status: getEmoji(joinDMSuccess)
            }), interaction.guild.translate("config/config:JOIN_DM_CONTENT", {
                enabled: joinDM?.enabled ? `**${interaction.guild.translate("common:YES").toLowerCase()}**` : `**${interaction.guild.translate("common:NO").toLowerCase()}**`,
                message: joinDM?.mainMessage ? `**${interaction.guild.translate("common:DEFINED").toLowerCase()}**` : `**${interaction.guild.translate("common:NOT_DEFINED").toLowerCase()}**`
            }), true)
            .addField(interaction.guild.translate("config/config:STORAGE_TITLE"), interaction.guild.settings.storageID, true)
            .setColor(data.color)
            .setFooter({ text: data.footer });
        interaction.reply({ embeds: [embed] });
    }
};
