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
        if(!bonus) return message.channel.send(message.language.addbonus.errors.bonus.missing(data.guild.prefix));
        if(isNaN(bonus) || (parseInt(bonus) < 1) || !Number.isInteger(parseInt(bonus))) return message.channel.send(message.language.addbonus.errors.bonus.incorrect(data.guild.prefix));

        const member = message.mentions.members.first() || await this.client.resolveMember(args.slice(1).join(" "), message.guild);
        if(!member) return message.channel.send(message.language.addbonus.errors.member.missing(data.guild.prefix));
        if(data.guild.blacklistedUsers.includes(member.id)) return message.channel.send(message.language.blacklist.blacklistedMember(member));

        const memberData = await this.client.database.fetchMember(member.id, message.guild.id);
        memberData.bonus += parseInt(bonus);
        await memberData.updateInvites();

        let embed = new Discord.MessageEmbed()
        .setAuthor(message.language.addbonus.title())
        .setDescription(message.language.addbonus.field(data.guild.prefix, member))
        .setColor(data.color)
        .setFooter(data.footer);

        message.channel.send(embed);
    }

};

module.exports = AddBonus;