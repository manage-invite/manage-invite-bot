const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class RemoveInvites extends Command {
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
        
        const member = args[0] ? await this.client.resolveMember(args.join(" "), message.guild) : null;
        const msg = await (member ? message.channel.send(message.language.removeinvites.loading.member(data.guild.prefix, member)) : message.channel.send(message.language.removeinvites.loading.all(data.guild.prefix)));
        if(member){
            const memberData = await this.client.database.fetchMember(member.id, message.guild.id);
            memberData.oldRegular = memberData.regular;
            memberData.regular = 0;
            memberData.oldFake = memberData.fake;
            memberData.fake = 0;
            memberData.oldLeaves = memberData.leaves;
            memberData.leaves = 0;
            memberData.oldBonus = memberData.bonus;
            memberData.bonus = 0;
            await memberData.updateInvites();
        } else {
            message.react(Discord.Util.parseEmoji(this.client.config.emojis.loading).id);
            // Find all members in the guild
            const members = await this.client.database.fetchMembers(message.guild.id, false);
            await this.client.functions.asyncForEach(members, async (memberData) => {
                memberData.oldRegular = memberData.regular;
                memberData.regular = 0;
                memberData.oldFake = memberData.fake;
                memberData.fake = 0;
                memberData.oldLeaves = memberData.leaves;
                memberData.leaves = 0;
                memberData.oldBonus = memberData.bonus;
                memberData.bonus = 0;
                await memberData.updateInvites();
            });
        }

        const embed = new Discord.MessageEmbed()
        .setAuthor(message.language.removeinvites.title())
        .setDescription((member ?
            message.language.removeinvites.titles.member(data.guild.prefix, member)
            : message.language.removeinvites.titles.all(data.guild.prefix)
        ))
        .setColor(data.color)
        .setFooter(data.footer);

        msg.edit(null, { embed });
        this.client.database.removeAllMembersFromOtherCaches(message.guild.id);

    }

};

module.exports = RemoveInvites;