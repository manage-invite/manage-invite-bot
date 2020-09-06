const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "restoreinvites",
            enabled: true,
            aliases: [ "resinvites", "restoreinv", "resinv", "restoreinvite", "restore-invites", "restore-invite" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        const member = args[0] ? await this.client.resolveMember(args.join(" "), message.guild) : null;
        if (member) member.data = await this.client.database.fetchMember(member.id, message.guild.id);
        let memberCount = { regular: 0, leaves: 0, fake: 0, bonus: 0 };
        if (!member){
            const m = await message.sendT("misc:PLEASE_WAIT", {
                loading: this.client.config.emojis.loading
            });
            memberCount = await this.client.database.countGuildInvites(message.guild.id);
            m.delete();
        }
        const conf = await (member ?
            message.sendT("admin/restoreinvites:CONFIRMATION_MEMBER", {
                prefix: data.guild.prefix,
                username: member.user.tag,
                regular: member.data.regular,
                leaves: member.data.leaves,
                bonus: member.data.bonus,
                fake: member.data.fake,
                error: this.client.config.emojis.error,
                success: this.client.config.emojis.success
            })
            : message.sendT("admin/restoreinvites:CONFIRMATION", {
                prefix: data.guild.prefix,
                regular: memberCount.regular,
                leaves: memberCount.leaves,
                bonus: memberCount.bonus,
                fake: memberCount.fake,
                error: this.client.config.emojis.error,
                success: this.client.config.emojis.success
            })
        );
        await message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
            if (collected.first().content === "cancel") return conf.error("common:CANCELLED", null, true);
            collected.first().delete();
            await (member ? conf.sendT("admin/restoreinvites:LOADING_MEMBER", {
                username: member.user.tag,
                loading: this.client.config.emojis.loading
            }, true) : conf.sendT("admin/restoreinvites:LOADING", {
                loading: this.client.config.emojis.loading
            }, true));
            if (member){
                // Restore invites
                member.data.regular = member.data.oldRegular;
                // Restore fake
                member.data.fake = member.data.oldFake;
                // Restore leaves
                member.data.leaves = member.data.oldLeaves;
                // Restore bonus
                member.data.bonus = member.data.oldBonus;
                // Save the member
                await member.data.updateInvites();
            } else {
                // Find all members in the guild
                await this.client.database.restoreInvites(message.guild.id);
            }

            const embed = new Discord.MessageEmbed()
                .setAuthor(message.translate("admin/restoreinvites:TITLE"))
                .setDescription((member ?
                    message.translate("admin/restoreinvites:DESCRIPTION_MEMBER", {
                        username: member.user.tag,
                        success: this.client.config.emojis.success
                    })
                    : message.translate("admin/restoreinvites:DESCRIPTION", {
                        success: this.client.config.emojis.success
                    })
                ))
                .setColor(data.color)
                .setFooter(data.footer);

            conf.edit(null, { embed });
        }).catch((err) => {
            console.error(err);
            conf.error("common:CANCELLED", null, true);
        });
    }

};
