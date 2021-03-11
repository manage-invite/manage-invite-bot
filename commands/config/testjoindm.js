const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "testjoindm",
            enabled: true,
            aliases: [ "testdm", "testdmjoin" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        
        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/testjoindm:TITLE"))
            .setDescription(message.translate("config/testleave:DESCRIPTION", {
                discord: Constants.Links.DISCORD
            }))
            .addField(message.translate("config/testleave:ENABLED_TITLE"), (data.guild.joinDM.enabled ? message.translate("config/testjoindm:ENABLED_YES_CONTENT", {
                prefix: message.guild.settings.prefix,
                success: this.client.config.emojis.success
            }) : message.translate("config/testjoindm:ENABLED_NO_CONTENT", {
                prefix: message.guild.settings.prefix,
                success: this.client.config.emojis.success
            })))
            .addField(message.translate("config/testleave:MESSAGE"), (data.guild.joinDM.mainMessage || message.translate("config/testjoindm:ENABLED_YES_CONTENT", {
                prefix: message.guild.settings.prefix
            })))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer)
            .setTimestamp();
        message.channel.send(embed);

        if (data.guild.joinDM.enabled && data.guild.joinDM.mainMessage){
            message.author.send(this.client.functions.formatMessage(
                data.guild.joinDM.mainMessage,
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
