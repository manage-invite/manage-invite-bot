const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

const Constants = require("../../Constants");

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
                prefix: data.guild.prefix,
                language: `${this.client.config.enabledLanguages.find((l) => l.name === data.guild.language).aliases[0]} \`${data.guild.language}\``
            }))
            .addField(message.translate("core/help:ADMIN_TITLE"), message.translate("core/help:ADMIN_CONTENT", {
                prefix: `\\${data.guild.prefix}`
            }), false)
            .addField(message.translate("core/help:RANKS_TITLE"), message.translate("core/help:RANKS_CONTENT", {
                prefix: `\\${data.guild.prefix}`
            }), false)
            .addField(message.translate("core/help:JOIN_DM_TITLE"), message.translate("core/help:JOIN_DM_CONTENT", {
                prefix: `\\${data.guild.prefix}`
            }), false)
            .addField(message.translate("core/help:JOIN_TITLE"), message.translate("core/help:JOIN_CONTENT", {
                prefix: `\\${data.guild.prefix}`
            }), false)
            .addField(message.translate("core/help:LEAVE_TITLE"), message.translate("core/help:LEAVE_CONTENT", {
                prefix: `\\${data.guild.prefix}`
            }), false)
            .addField(message.translate("core/help:INVITES_TITLE"), message.translate("core/help:INVITES_CONTENT", {
                prefix: `\\${data.guild.prefix}`
            }), false)
            .addField(message.translate("core/help:CORE_TITLE"), message.translate("core/help:CORE_CONTENT", {
                prefix: `\\${data.guild.prefix}`
            }), false)
            .addField(message.translate("core/help:TIP", {
                prefix: `\\${data.guild.prefix}`
            }), message.translate("core/help:DASHBOARD", {
                dashboard: Constants.Links.DASHBOARD
            })+"\n\n"+ message.translate("misc:LINKS_FOOTER", {
                clientID: this.client.user.id,
                discord: Constants.Links.DISCORD
            }))
            .setThumbnail(message.author.displayAvatarURL())
            .setColor(data.color);

        message.channel.send(embed);
    }
};
