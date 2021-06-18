const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "sync-invites",
            enabled: true,
            aliases: [ "sync" ],
            clientPermissions: [ "MANAGE_GUILD" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        const guildInvites = await message.guild.fetchInvites();
        if (guildInvites.size === 0) return message.error("admin/sync-invites:NO_INVITES");
        const inviteCount = guildInvites.map((i) => i.uses).reduce((p, c) => p + c);
        const conf = await message.sendT("admin/sync-invites:CONFIRM", {
            success: Constants.Emojis.SUCCESS,
            error: Constants.Emojis.ERROR,
            inviteCount
        });
        await message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
            if (collected.first().content === "cancel") return conf.error("common:CANCELLED", null, true);
            collected.first().delete().catch(() => {});
            const users = new Set(guildInvites.filter((i) => i.inviter).map((i) => i.inviter.id));
            const newStorageID = await this.client.database.removeGuildInvites(message.guild.id);
            await this.client.functions.asyncForEach(Array.from(users), async (user) => {
                const memberData = await this.client.database.fetchGuildMember({
                    userID: user,
                    guildID: message.guild.id,
                    storageID: newStorageID
                });
                if (memberData.notCreated) await this.client.database.createGuildMember({
                    userID: user,
                    guildID: message.guild.id,
                    storageID: newStorageID
                });
                await this.client.database.addInvites({
                    userID: user,
                    guildID: message.guild.id,
                    storageID: newStorageID,
                    number: guildInvites.filter((i) => i.inviter && i.inviter.id === user).map((i) => i.uses).reduce((p, c) => p + c),
                    type: "regular"
                });
            });
            const embed = new Discord.MessageEmbed()
                .setAuthor(message.translate("admin/sync-invites:TITLE"))
                .setDescription(message.translate("admin/sync-invites:DESCRIPTION"))
                .setColor(data.color)
                .setFooter(data.footer);
            conf.edit({ embeds: [embed] });
        }).catch((err) => {
            console.error(err);
            conf.error("common:CANCELLED", null, true);
        });
    }

};
