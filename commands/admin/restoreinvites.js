const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class RestoreInvites extends Command {
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

        let member = args[0] ? await this.client.resolveMember(args.join(" "), message.guild) : null;
        if(member) member.data = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id });
        let members = null;
        let memberCount = { invites: 0, leaves: 0, fake: 0, bonus: 0 };
        if(!member){
            members = await this.client.guildMembersData.find({ guildID: message.guild.id });
            members.forEach((m) => {
                memberCount.invites += m.old_invites;
                memberCount.leaves += m.old_leaves;
                memberCount.fake += m.old_fake;
                memberCount.bonus += m.old_bonus;
            });
        }
        let conf = await (member ?
            message.channel.send(message.language.restoreinvites.confirmations.member(data.guild.prefix, member))
            : message.channel.send(message.language.restoreinvites.confirmations.all(data.guild.prefix, memberCount))
        );
        await message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
            if(collected.first().content === "cancel") return conf.edit(message.language.restoreinvites.confirmations.cancelled());
            collected.first().delete();
            await (member ? conf.edit(message.language.restoreinvites.loading.member(data.guild.prefix, member)) : conf.edit(message.language.restoreinvites.loading.all(data.guild.prefix)));
            if(member){
                // Restore invites
                member.data.invites = memberData.old_invites;
                // Restore fake
                member.data.fake = memberData.old_fake;
                // Restore leaves
                member.data.leaves = memberData.old_leaves;
                // Restore bonus
                member.data.bonus = memberData.old_bonus;
                // Save the member
                await member.data.save();
            } else {
                // Find all members in the guild
                await this.client.functions.asyncForEach(members, async (memberData) => {
                    // Restore invites
                    memberData.invites = memberData.old_invites;
                    // Restore fake
                    memberData.fake = memberData.old_fake;
                    // Restore leaves
                    memberData.leaves = memberData.old_leaves;
                    // Restore bonus
                    memberData.bonus = memberData.old_bonus;
                    // Restore the member
                    await memberData.save();
                });
            }

            let embed = new Discord.MessageEmbed()
            .setAuthor(message.language.restoreinvites.title())
            .setDescription((member ?
                message.language.restoreinvites.titles.member(data.guild.prefix, member)
                : message.language.restoreinvites.titles.all(data.guild.prefix)
            ))
            .setColor(data.color)
            .setFooter(data.footer);

            conf.edit(null, { embed });
        }).catch(() => {
            conf.edit(message.language.restoreinvites.confirmations.cancelled());
        });
    }

};

module.exports = RestoreInvites;