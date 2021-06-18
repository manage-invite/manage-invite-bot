const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "removeinvites",
            enabled: true,
            aliases: [ "rinvites", "removeinv", "rinv", "removeinvite", "remove-invites", "remove-invite" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        
        const conf = await message.sendT("admin/removeinvites:CONFIRMATION", {
            error: Constants.Emojis.ERROR,
            success: Constants.Emojis.SUCCESS
        });
        await message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
            if (collected.first().content === "cancel") return conf.error("common:CANCELLED", null, true);
            collected.first().delete().catch(() => {});

            await conf.sendT("admin/removeinvites:LOADING", {
                loading: Constants.Emojis.LOADING,
                prefix: message.guild.settings.prefix
            }, true);

            await this.client.database.removeGuildInvites(message.guild.id);

            const embed = new Discord.MessageEmbed()
                .setAuthor(message.translate("admin/removeinvites:TITLE"))
                .setDescription(message.translate("admin/removeinvites:DESCRIPTION", {
                    success: Constants.Emojis.SUCCESS
                }))
                .setColor(data.color)
                .setFooter(data.footer);

            conf.edit({ embeds: [embed] });
        }).catch((err) => {
            console.error(err);
            return conf.error("common:CANCELLED", null, true);
        });

    }

};
