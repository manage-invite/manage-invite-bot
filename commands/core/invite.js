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

        const blacklistedUsers = await this.client.database.fetchGuildBlacklistedUsers(message.guild.id);
        if (blacklistedUsers.includes(message.author.id)) return message.error("admin/blacklist:AUTHOR_BLACKLISTED");

        const member = await this.client.resolveMember(args.join(" "), message.guild) || message.member || await message.guild.members.fetch(message.author.id).catch(() => {});
        const memberData = await this.client.database.fetchGuildMember({
            storageID: message.guild.settings.storageID,
            userID: member.id,
            guildID: message.guild.id
        });

        const translation = {
            username: member.user.username,
            inviteCount: memberData.invites,
            regularCount: memberData.regular,
            bonusCount: memberData.bonus,
            fakeCount: memberData.fake > 0 ? `-${memberData.fake}` : memberData.fake,
            leavesCount: memberData.leaves > 0 ? `-${memberData.leaves}` : memberData.leaves
        };

        const description =  member.id === message.member.id ?
            message.translate("core/invite:AUTHOR_CONTENT", translation) :
            message.translate("core/invite:MEMBER_CONTENT", translation);


        const embed = new Discord.MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL())
            .setDescription(description)
            .setColor(data.color)
            .setFooter(data.footer);

        message.channel.send({ embeds: [embed] });
    }

};
