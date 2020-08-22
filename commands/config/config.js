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

        const joinSuccess = data.guild.join.enabled
        && data.guild.join.mainMessage
        && data.guild.join.channel
        && message.guild.channels.cache.get(data.guild.join.channel);

        const joinDMSuccess = data.guild.joinDM.enabled
        && data.guild.joinDM.mainMessage;

        const leaveSuccess = data.guild.leave.enabled
        && data.guild.leave.mainMessage
        && data.guild.leave.channel
        && message.guild.channels.cache.get(data.guild.leave.channel);

        const getEmoji = (boolean) => boolean ? this.client.config.emojis.success : this.client.config.emojis.error;

        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/config:TITLE", {
                guild: message.guild.name
            }))
            .addField(message.translate("config/config:JOIN_TITLE", {
                emoji: getEmoji(joinSuccess)
            }), message.translate("config/config:JOIN_CONTENT", {
                enabled: joinSuccess ? `**${message.translate("common:YES").toLowerCase()}**` : `**${message.translate("common:NO").toLowerCase()}**`,
                message: data.guild.join.mainMessage ? `**${message.translate("common:DEFINED").toLowerCase()}**` : `**${message.translate("common:NOT_DEFINED").toLowerCase()}**`,
                channel: data.guild.join.channel ? `**${message.translate("common:DEFINED").toLowerCase()}**` : `**${message.translate("common:NOT_DEFINED").toLowerCase()}**`
            }), true)
            .addField(message.translate("config/config:LEAVE_TITLE", {
                emoji: getEmoji(joinSuccess)
            }), message.translate("config/config:JOIN_CONTENT", {
                enabled: leaveSuccess ? `**${message.translate("common:YES").toLowerCase()}**` : `**${message.translate("common:NO").toLowerCase()}**`,
                message: data.guild.leave.mainMessage ? `**${message.translate("common:DEFINED").toLowerCase()}**` : `**${message.translate("common:NOT_DEFINED").toLowerCase()}**`,
                channel: data.guild.leave.channel ? (message.guild.channels.cache.get(data.guild.leave.channel) ? `**${message.translate("common:DEFINED").toLowerCase()}**` : message.translate("config/config:CHANNEL_NOT_FOUND")) : `**${message.translate("common:NOT_DEFINED").toLowerCase()}**`
            }), true)
            .addField(message.translate("config/config:JOIN_DM_TITLE", {
                emoji: getEmoji(joinSuccess)
            }), message.translate("config/config:JOIN_DM_CONTENT", {
                enabled: joinDMSuccess ? `**${message.translate("common:YES").toLowerCase()}**` : `**${message.translate("common:NO").toLowerCase()}**`,
                message: data.guild.joinDM.mainMessage ? `**${message.translate("common:DEFINED").toLowerCase()}**` : `**${message.translate("common:NOT_DEFINED").toLowerCase()}**`
            }), true)
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);
    }
};
