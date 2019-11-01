const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class Invite extends Command {
    constructor (client) {
        super(client, {
            name: "invite",
            enabled: true,
            aliases: [ "invites" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let member = await this.client.resolveMember(args.join(" "), message.guild) || message.member;
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id, bot: member.user.bot });

        let description = ((member.id !== message.member.id) ? 
        `**${member.user.username}** has`
        : "You have") + ` **${memberData.invites + memberData.bonus - memberData.leaves - memberData.fake}** invites! (**${memberData.invites}** regular, **${memberData.bonus}** bonus, **${memberData.fake > 0 ? `-${memberData.fake}` : `${memberData.fake}`}** fake, **${memberData.leaves > 0 ? `-${memberData.leaves}` : `${memberData.leaves}`}** leaves)`;
        
        let embed = new Discord.MessageEmbed()
        .setAuthor(member.user.tag, member.user.displayAvatarURL())
        .setDescription(description)
        .setColor(data.color)
        .setFooter(data.footer);

        message.channel.send(embed);
    }

};

module.exports = Invite;