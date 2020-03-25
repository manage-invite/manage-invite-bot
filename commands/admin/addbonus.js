const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class AddBonus extends Command {
    constructor (client) {
        super(client, {
            name: "addbonus",
            enabled: true,
            aliases: [ "addinvites", "addinvite" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        const bonus = args[0];
        if(!bonus) return message.error("admin/addbonus:MISSING_AMOUNT", {
            prefix: data.guild.prefix
        });
        if(isNaN(bonus) || (parseInt(bonus) < 1) || !Number.isInteger(parseInt(bonus))) return message.error("admin/addbonus:INVALID_AMOUNT", {
            prefix: data.guild.prefix
        });

        const member = message.mentions.members.first() || await this.client.resolveMember(args.slice(1).join(" "), message.guild);
        if(!member) return message.error("admin/addbonus:MISSING_MEMBER", {
            prefix: data.guild.prefix
        });
        if(data.guild.blacklistedUsers.includes(member.id)) return message.error("admin/blacklist:BLACKLISTED", {
            username: member.user.username
        });

        const memberData = await this.client.database.fetchMember(member.id, message.guild.id);
        memberData.bonus += parseInt(bonus);
        await memberData.updateInvites();

        const embed = new Discord.MessageEmbed()
        .setAuthor(message.translate("admin/addbonus:SUCCESS_TITLE"))
        .setDescription(message.translate("admin/addbonus:SUCCESS_CONTENT", {
            prefix: data.guild.prefix,
            usertag: member.user.tag,
            username: member.user.username
        }))
        .setColor(data.color)
        .setFooter(data.footer);

        message.channel.send(embed);
    }

};

module.exports = AddBonus;