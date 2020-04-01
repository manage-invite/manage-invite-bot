const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "invite",
            enabled: true,
            aliases: [ "invites", "rank" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        if(data.guild.blacklistedUsers.includes(message.author.id)) return message.error("admin/blacklist:AUTHOR_BLACKLISTED");

        const member = await this.client.resolveMember(args.join(" "), message.guild) || message.member;
        const memberData = await this.client.database.fetchMember(member.id, message.guild.id);
        await this.client.functions.assignRanks(member, memberData.calcInvites(), data.guild.ranks);
        const nextRank = this.client.functions.getNextRank(memberData.calcInvites(), data.guild.ranks);

        const firstDescription =  member.id === message.member.id ?
        message.translate("core/invite:AUTHOR_CONTENT", {
            inviteCount: memberData.calcInvites(),
            regularCount: memberData.regular,
            bonusCount: memberData.bonus,
            fakeCount: memberData.fake > 0 ? `-${memberData.fake}` : memberData.fake,
            leavesCount: memberData.leaves > 0 ? `-${memberData.leaves}` : memberData.leaves
        }) :
        message.translate("core/invite:MEMBER_CONTENT", {
            username: member.user.username,
            inviteCount: memberData.calcInvites(),
            regularCount: memberData.regular,
            bonusCount: memberData.bonus,
            fakeCount: memberData.fake > 0 ? `-${memberData.fake}` : memberData.fake,
            leavesCount: memberData.leaves > 0 ? `-${memberData.leaves}` : memberData.leaves
        });

        const secondDescription = member.id === message.member.id && nextRank ?
        message.translate("core/invite:AUTHOR_NEXT_RANK", {
            neededCount: nextRank.inviteCount - memberData.calcInvites(),
            rankName: message.guild.roles.cache.get(nextRank.roleID) || "deleted-role"
        }) : "";

        const embed = new Discord.MessageEmbed()
        .setAuthor(member.user.tag, member.user.displayAvatarURL())
        .setDescription(firstDescription+secondDescription)
        .setColor(data.color)
        .setFooter(data.footer);

        message.channel.send(embed);
    }

};
