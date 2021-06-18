const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

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
        if (member) member.data = await this.client.database.fetchGuildMember({
            userID: member.id,
            guildID: message.guild.id
        });
        let memberCount = { regular: 0, leaves: 0, fake: 0, bonus: 0 };
        if (!member){
            const m = await message.sendT("misc:PLEASE_WAIT", {
                loading: Constants.Emojis.LOADING
            });
            memberCount = await this.client.database.countGuildInvites(message.guild.id, message.guild.settings.storageID);
            if (!memberCount) {
                return message.error("admin/restoreinvites:NO_BACKUP");
            }
            m.delete();
        }
        const conf = await message.sendT("admin/restoreinvites:CONFIRMATION", {
            prefix: message.guild.settings.prefix,
            regular: memberCount.regular,
            leaves: memberCount.leaves,
            bonus: memberCount.bonus,
            fake: memberCount.fake,
            error: Constants.Emojis.ERROR,
            success: Constants.Emojis.SUCCESS
        });
        await message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
            if (!collected.first() || !collected.first().content === "cancel") return conf.error("common:CANCELLED", null, true);
            collected.first().delete().catch(() => {});
            await conf.sendT("admin/restoreinvites:LOADING", {
                loading: Constants.Emojis.LOADING
            }, true);

            await this.client.database.restoreGuildInvites(message.guild.id, message.guild.settings.storageID);

            const embed = new Discord.MessageEmbed()
                .setAuthor(message.translate("admin/restoreinvites:TITLE"))
                .setDescription(message.translate("admin/restoreinvites:DESCRIPTION", {
                    success: Constants.Emojis.SUCCESS
                }))
                .setColor(data.color)
                .setFooter(data.footer);

            conf.edit({ embeds: [embed] });
        }).catch((err) => {
            console.error(err);
            conf.error("common:CANCELLED", null, true);
        });
    }

};
