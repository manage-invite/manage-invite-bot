const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "testleave",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
   
        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/testleave:TITLE"))
            .setDescription(message.translate("config/testleave:DESCRIPTION"))
            .addField(message.translate("config/testleave:ENABLED_TITLE"), (data.guild.leave.enabled ? message.translate("config/testleave:ENABLED_YES_CONTENT", {
                prefix: data.guild.prefix,
                success: this.client.config.emojis.success
            }) : message.translate("config/testleave:ENABLED_NO_CONTENT", {
                prefix: data.guild.prefix,
                success: this.client.config.emojis.success
            })))
            .addField(message.translate("config/testleave:MESSAGE"), (data.guild.leave.mainMessage || message.translate("config/testleave:ENABLED_YES_CONTENT", {
                prefix: data.guild.prefix
            })))
            .addField(message.translate("config/testleave:CHANNEL_TITLE"), (data.guild.leave.channel ? `<#${data.guild.leave.channel}>` : message.translate("config/testleave:CHANNEL_CONTENT", {
                prefix: data.guild.prefix
            })))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer)
            .setTimestamp();
        message.channel.send(embed);
        
        if (data.guild.leave.enabled && data.guild.leave.mainMessage && data.guild.leave.channel && message.guild.channels.cache.get(data.guild.leave.channel)){
            message.guild.channels.cache.get(data.guild.leave.channel).send(this.client.functions.formatMessage(
                data.guild.leave.mainMessage,
                message.member,
                1,
                (data.guild.language || "english").substr(0, 2),
                {
                    inviter: message.client.user,
                    inviterData: {
                        regular: 1,
                        fake: 0,
                        bonus: 0,
                        leaves: 0
                    },
                    invite: {
                        code: "436SPZX",
                        url: "https://discord.gg/436SPZX",
                        uses: 1,
                        channel: message.channel
                    }
                }                
            )).catch(() => {
                return message.error("misc:CANNOT_SEND");
            });
        }
    }
};
