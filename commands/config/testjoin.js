const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "testjoin",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
   
        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/testjoin:TITLE"))
            .setDescription(message.translate("config/testjoin:DESCRIPTION"))
            .addField(message.translate("config/testjoin:ENABLED"), (data.guild.join.enabled ? message.translate("config/testjoin:ENABLED_YES_CONTENT", {
                prefix: data.guild.prefix,
                success: this.client.config.emojis.success
            }) : message.translate("config/testjoin:ENABLED_NO_CONTENT", {
                prefix: data.guild.prefix,
                success: this.client.config.emojis.success
            })))
            .addField(message.translate("config/testjoin:MESSAGE"), (data.guild.join.message || message.translate("config/testjoin:ENABLED_YES_CONTENT", {
                prefix: data.guild.prefix
            })))
            .addField(message.translate("config/testjoin:CHANNEL"), (data.guild.join.channel ? `<#${data.guild.join.channel}>` : message.translate("config/testjoin:CHANNEL_CONTENT", {
                prefix: data.guild.prefix
            })))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer)
            .setTimestamp()
        message.channel.send(embed);
        
        if(data.guild.join.enabled && data.guild.join.message && data.guild.join.channel && message.guild.channels.cache.get(data.guild.join.channel)){
            message.guild.channels.cache.get(data.guild.join.channel).send(this.client.functions.formatMessage(
                data.guild.join.message,
                message.member,
                message.client.user,
                {
                    code: "436SPZX",
                    url: "https://discord.gg/436SPZX",
                    uses: 1
                },
                (data.guild.language || "english").substr(0, 2),
                {
                    regular: 1,
                    fake: 0,
                    bonus: 0,
                    leaves: 0
                }
            )).catch(() => {
                return message.channel.send(message.language.errors.sendPerm());
            });
        }
    }
}
