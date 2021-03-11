const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

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
        
        const user = args[0] ? await this.client.resolveUser(args.join(" ")) : null;
        const conf = await message.sendT("admin/removeinvites:CONFIRMATION", {
            error: this.client.config.emojis.error,
            success: this.client.config.emojis.success
        })
        await message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
            if (collected.first().content === "cancel") return conf.error("common:CANCELLED", null, true);
            collected.first().delete().catch(() => {});

            const msg = await message.sendT("admin/removeinvites:LOADING", {
                loading: this.client.config.emojis.loading,
                prefix: message.guild.settings.prefix
            });

            await this.client.database.removeGuildInvites(message.guild.id);

            const embed = new Discord.MessageEmbed()
                .setAuthor(message.translate("admin/removeinvites:TITLE"))
                .setDescription(message.translate("admin/removeinvites:DESCRIPTION", {
                    success: this.client.config.emojis.success
                }))
                .setColor(data.color)
                .setFooter(data.footer);

            msg.edit(null, { embed });
        }).catch((err) => {
            console.error(err);
            return conf.error("common:CANCELLED", null, true);
        });

    }

};
