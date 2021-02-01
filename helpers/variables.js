/* aliases are old name of the variables */

module.exports = [
    {
        name: "user",
        display: (member) => member.toString()
    },
    {
        name: "username",
        aliases: ["user.name"],
        display: (member) => member.user.username
    },
    {
        name: "usertag",
        aliases: ["user.tag"],
        display: (member) => member.user.tag
    },
    {
        name: "userId",
        aliases: ["user.id"],
        display: (member) => member.id
    },
    {
        name: "userCreatedSince",
        aliases: ["user.createdat"],
        display: (member, numJoins, invData, moment) => moment(member.user.createdAt).fromNow()
    },
    {
        name: "userCreatedAt",
        display: (member, numJoins, invData, moment) => moment(member.user.createdAt).format("LL")
    },
    {
        name: "userNumJoins",
        aliases: ["numJoins"],
        display: (member, numJoins) => numJoins
    },
    {
        name: "userAvatar",
        display: (member) => member.user.displayAvatarURL(),
        endPart: true
    },
    {
        name: "serverName",
        aliases: ["server", "guild"],
        display: (member) => member.guild.name
    },
    {
        name: "serverMemberCount",
        aliases: ["server.count", "guild.count"],
        display: (member) => member.guild.memberCount,
        endPart: true
    },
    {
        name: "inviter",
        requireInviter: true,
        display: (member, numJoins, { inviter }) => inviter.toString()
    },
    {
        name: "inviterName",
        aliases: ["inviter.name"],
        requireInviter: true,
        display: (member, numJoins, { inviter }) => inviter.name
    },
    {
        name: "inviterTag",
        aliases: ["inviter.tag"],
        requireInviter: true,
        display: (member, numJoins, { inviter }) => inviter.tag
    },
    {
        name: "inviterId",
        aliases: ["inviter.id"],
        requireInviter: true,
        display: (member, numJoins, { inviter }) => inviter.id
    },
    {
        name: "inviterAvatar",
        requireInviter: true,
        display: (member, numJoins, { inviter }) => inviter.displayAvatarURL()
    },
    {
        name: "inviterInvites",
        aliases: ["inviter.invites"],
        requireInviter: true,
        display: (member, numJoins, { inviterData }) => inviterData.regular + inviterData.bonus - inviterData.fake - inviterData.leaves,
        endPart: true
    },
    {
        name: "inviteCode",
        aliases: ["invite.code"],
        requireInviter: true,
        display: (member, numJoins, { invite }) => invite.code,
        ignore: true
    },
    {
        name: "inviteURL",
        aliases: ["invite.url"],
        requireInviter: true,
        display: (member, numJoins, { invite }) => invite.url
    },
    {
        name: "inviteUses",
        aliases: ["invite.uses"],
        requireInviter: true,
        display: (member, numJoins, { invite }) => invite.uses
    },
    {
        name: "inviteChannel",
        aliases: ["invite.channel"],
        requireInviter: true,
        display: (member, numJoins, { invite }) => invite.channel,
        ignore: true
    }
];
