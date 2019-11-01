const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class RemoveBonus extends Command {
    constructor (client) {
        super(client, {
            name: "removebonus",
            enabled: true,
            aliases: [ "delbonus", "removebonus", "removeinvites", "removeinvite" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        let bonus = args[0];
        if(!bonus) return message.channel.send(this.client.config.emojis.error+" | You must write the number of bonus invites you want to remove. (Syntax: "+data.guild.prefix+"removebonus number @member)");
        if(isNaN(bonus)) return message.channel.send(this.client.config.emojis.error+" | You must write a __**valid**__ number of bonus invites that you want to remove. (Syntax: "+data.guild.prefix+"removebonus number @member)");

        let member = message.mentions.members.first() || await this.client.resolveMember(args.slice(1).join(" "), message.guild);
        if(!member) return message.channel.send(this.client.config.emojis.error+" | You must mention the member to whom you want to remove the bonus invites. (Syntax: "+data.guild.prefix+"removebonus number @member)");
    
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id, bot: member.user.bot });
        memberData.bonus += parseInt(bonus);
        memberData.markModified("bonus");
        await memberData.save();

        let embed = new Discord.MessageEmbed()
        .setAuthor("📥 Bonus Invites Removed")
        .setDescription("Write `"+data.guild.prefix+"invites "+member.user.tag+"` to see the new number of invites of **"+member.user.username+"** !")
        .setColor(data.color)
        .setFooter(data.footer);

        message.channel.send(embed);
    }

};

module.exports = RemoveBonus;