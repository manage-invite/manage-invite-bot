const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

const Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "help",
            enabled: true,
            aliases: [ "h", "aide" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
   
        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("core/help:TITLE"))
            .setDescription(message.translate("core/help:DESCRIPTION", {
                guildName: message.guild.name,
                prefix: message.guild.settings.prefix,
                language: `${this.client.enabledLanguages.find((l) => l.name === message.guild.settings.language).aliases[0]} \`${message.guild.settings.language}\``
            }))
            .addField(message.translate("core/help:ADMIN_TITLE"), message.translate("core/help:ADMIN_CONTENT", {
                prefix: `\\${message.guild.settings.prefix}`
            }), false)
            .addField(message.translate("core/help:JOIN_DM_TITLE"), message.translate("core/help:JOIN_DM_CONTENT", {
                prefix: `\\${message.guild.settings.prefix}`
            }), false)
            .addField(message.translate("core/help:JOIN_TITLE"), message.translate("core/help:JOIN_CONTENT", {
                prefix: `\\${message.guild.settings.prefix}`
            }), false)
            .addField(message.translate("core/help:LEAVE_TITLE"), message.translate("core/help:LEAVE_CONTENT", {
                prefix: `\\${message.guild.settings.prefix}`
            }), false)
            .addField(message.translate("core/help:INVITES_TITLE"), message.translate("core/help:INVITES_CONTENT", {
                prefix: `\\${message.guild.settings.prefix}`
            }), false)
            .addField(message.translate("core/help:CORE_TITLE"), message.translate("core/help:CORE_CONTENT", {
                prefix: `\\${message.guild.settings.prefix}`
            }), false)
            .addField(message.translate("core/help:TIP", {
                prefix: `\\${message.guild.settings.prefix}`
            }), message.translate("core/help:DASHBOARD", {
                dashboard: Constants.Links.DASHBOARD
            })+"\n\n"+ message.translate("misc:LINKS_FOOTER", {
                clientID: this.client.user.id,
                discord: Constants.Links.DISCORD
            }))
            .setThumbnail(message.author.displayAvatarURL())
            .setColor(data.color);

        message.channel.send({ embeds: [embed] });
    }
};
