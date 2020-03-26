const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class SyncInvites extends Command {
    constructor (client) {
        super(client, {
            name: "sync-invites",
            enabled: true,
            aliases: [ "sync" ],
            clientPermissions: [ "MANAGE_INVITES" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        let guildInvites = await message.guild.fetchInvites();
        if(guildInvites.size === 0) return message.channel.send(message.language.syncinvites.no());
        let invitesCount = guildInvites.map((i) => i.uses).reduce((p, c) => p + c);
        let conf = await message.channel.send(message.language.syncinvites.confirmations.all(invitesCount));
        message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
            if(collected.first().content === "cancel") return conf.edit(message.language.syncinvites.confirmations.cancelled());
            collected.first().delete();
            let users = new Set(guildInvites.filter((i) => i.inviter).map((i) => i.inviter.id));
            await this.client.functions.asyncForEach(Array.from(users), async (user) => {
                const memberData = await this.client.database.fetchMember(user, message.guild.id);
                memberData.regular = guildInvites.filter((i) => i.inviter && i.inviter.id === user).map((i) => i.uses).reduce((p, c) => p + c);
                await memberData.updateInvites();
            });
            let embed = new Discord.MessageEmbed()
            .setAuthor(message.language.syncinvites.title())
            .setDescription(message.language.restoreinvites.titles.all())
            .setColor(data.color)
            .setFooter(data.footer);
            conf.edit(null, { embed });
        }).catch(() => {
            conf.edit(message.language.syncinvites.confirmations.cancelled());
        });
    }

};

module.exports = SyncInvites;