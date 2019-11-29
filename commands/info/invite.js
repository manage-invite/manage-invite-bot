const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class Invite extends Command {
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

        let member = await this.client.resolveMember(args.join(" "), message.guild) || message.member;
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id, bot: member.user.bot });
        let guildData = await this.client.findOrCreateGuild({ id: message.guild.id });
        await this.client.functions.assignRanks(member, memberData.calcInvites(), data.guild.ranks);
        let nextRank = this.client.functions.getNextRank(memberData.calcInvites(), data.guild.ranks);

        let description = message.language.invite.description(member, memberData, (member.id === message.member.id), nextRank, (nextRank ? message.guild.roles.get(nextRank.roleID) : null));
        
        let embed = new Discord.MessageEmbed()
        .setAuthor(member.user.tag, member.user.displayAvatarURL())
        .setDescription(description)
        .setColor(data.color)
        .setFooter(data.footer);

        message.channel.send(embed);
    }

};

module.exports = Invite;