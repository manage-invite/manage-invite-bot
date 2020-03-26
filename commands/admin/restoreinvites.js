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
        if(member) member.data = await this.client.database.fetchMember(member.id, message.guild.id);
        let members = null;
        let memberCount = { regular: 0, leaves: 0, fake: 0, bonus: 0 };
        if(!member){
            message.react(Discord.Util.parseEmoji(this.client.config.emojis.loading).id);
            members = await this.client.database.fetchMembers(message.guild.id, false);
            members.forEach((m) => {
                memberCount.regular += m.oldRegular;
                memberCount.leaves += m.oldLeaves;
                memberCount.fake += m.oldFake;
                memberCount.bonus += m.oldBonus;
            });
        }
        let conf = await (member ?
            message.channel.send(message.language.restoreinvites.confirmations.member(data.guild.prefix, member))
            : message.channel.send(message.language.restoreinvites.confirmations.all(data.guild.prefix, memberCount))
        );
        message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
            if(collected.first().content === "cancel") return conf.edit(message.language.restoreinvites.confirmations.cancelled());
            collected.first().delete();
            await (member ? conf.edit(message.language.restoreinvites.loading.member(member)) : conf.edit(message.language.restoreinvites.loading.all()));
            if(member){
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
                await this.client.functions.asyncForEach(members, async (memberData) => {
                    // Restore invites
                    memberData.regular = memberData.oldRegular;
                    // Restore fake
                    memberData.fake = memberData.oldFake;
                    // Restore leaves
                    memberData.leaves = memberData.oldLeaves;
                    // Restore bonus
                    memberData.bonus = memberData.oldBonus;
                    // Save the member
                    await memberData.updateInvites();
                });
            }

            const embed = new Discord.MessageEmbed()
            .setAuthor(message.language.restoreinvites.title())
            .setDescription((member ?
                message.language.restoreinvites.titles.member(member)
                : message.language.restoreinvites.titles.all()
            ))
            .setColor(data.color)
            .setFooter(data.footer);

            conf.edit(null, { embed });
            this.client.database.removeAllMembersFromOtherCaches(message.guild.id);
        }).catch((e) => {
            console.log(e)
            conf.edit(message.language.restoreinvites.confirmations.cancelled());
        });
    }

};

module.exports = RestoreInvites;