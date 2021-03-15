const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "config",
            enabled: true,
            aliases: [ "conf", "configuration" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        const plugins = await this.client.database.fetchGuildPlugins(message.guild.id);

        const join = plugins.find((plugin) => plugin.pluginName === 'join')?.pluginData;
        const joinDM = plugins.find((plugin) => plugin.pluginName === 'joinDM')?.pluginData;
        const leave = plugins.find((plugin) => plugin.pluginName === 'leave')?.pluginData;

        const joinSuccess = join?.enabled
        && join?.mainMessage
        && join?.channel
        && message.guild.channels.cache.get(join?.channel);

        const joinDMSuccess = joinDM?.enabled
        && joinDM?.mainMessage;

        const leaveSuccess = leave?.enabled
        && leave?.mainMessage
        && leave?.channel
        && message.guild.channels.cache.get(leave?.channel);

        const getEmoji = (boolean) => boolean ? this.client.config.emojis.success : this.client.config.emojis.error;

        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/config:TITLE", {
                guild: message.guild.name
            }))
            .addField(message.translate("config/config:JOIN_TITLE", {
                emoji: getEmoji(joinSuccess)
            }), message.translate("config/config:JOIN_CONTENT", {
                enabled: joinSuccess ? `**${message.translate("common:YES").toLowerCase()}**` : `**${message.translate("common:NO").toLowerCase()}**`,
                message: join?.mainMessage ? `**${message.translate("common:DEFINED").toLowerCase()}**` : `**${message.translate("common:NOT_DEFINED").toLowerCase()}**`,
                channel: join?.channel ? `**${message.translate("common:DEFINED").toLowerCase()}**` : `**${message.translate("common:NOT_DEFINED").toLowerCase()}**`
            }), true)
            .addField(message.translate("config/config:LEAVE_TITLE", {
                emoji: getEmoji(joinSuccess)
            }), message.translate("config/config:JOIN_CONTENT", {
                enabled: leaveSuccess ? `**${message.translate("common:YES").toLowerCase()}**` : `**${message.translate("common:NO").toLowerCase()}**`,
                message: leave?.mainMessage ? `**${message.translate("common:DEFINED").toLowerCase()}**` : `**${message.translate("common:NOT_DEFINED").toLowerCase()}**`,
                channel: leave?.channel ? (message.guild.channels.cache.get(leave.channel) ? `**${message.translate("common:DEFINED").toLowerCase()}**` : message.translate("config/config:CHANNEL_NOT_FOUND")) : `**${message.translate("common:NOT_DEFINED").toLowerCase()}**`
            }), true)
            .addField(message.translate("config/config:JOIN_DM_TITLE", {
                emoji: getEmoji(joinSuccess)
            }), message.translate("config/config:JOIN_DM_CONTENT", {
                enabled: joinDMSuccess ? `**${message.translate("common:YES").toLowerCase()}**` : `**${message.translate("common:NO").toLowerCase()}**`,
                message: joinDM?.mainMessage ? `**${message.translate("common:DEFINED").toLowerCase()}**` : `**${message.translate("common:NOT_DEFINED").toLowerCase()}**`
            }), true)
            .addField(message.translate("config/config:STORAGE_TITLE"), message.guild.settings.storageID, true)
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);
    }
};
