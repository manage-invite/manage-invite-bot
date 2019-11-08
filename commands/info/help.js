const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class Help extends Command {
    constructor (client) {
        super(client, {
            name: "help",
            enabled: true,
            aliases: [ "h", "aide" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
   
        let embed = new Discord.MessageEmbed()
            .setTitle(message.language.help.title())
            .setDescription(message.language.help.description(message.guild.name, data.guild.prefix))
            .addField(message.language.help.admin.title(), message.language.help.admin.content(data.guild.prefix), false)
            .addField(message.language.help.ranks.title(), message.language.help.ranks.content(data.guild.prefix), false);

            if(data.guild.premium){
                embed.addField(message.language.help.joinDM.title(), message.language.help.joinDM.content(data.guild.prefix), true);
            }

            embed.addField(message.language.help.join.title(), message.language.help.join.content(data.guild.prefix), true)
            .addField(message.language.help.leave.title(), message.language.help.leave.content(data.guild.prefix), true)
            .addField(message.language.help.invites.title(), message.language.help.invites.content(data.guild.prefix), false)
            .addField(message.language.help.manageInvite.title(), message.language.help.manageInvite.content(data.guild.prefix), false)
            .addField(message.language.help.tip(data.guild.prefix), message.language.utils.conf.content()+"\n\n"+message.language.help.links(this.client.user.id))
            .setThumbnail(message.author.displayAvatarURL())
            .setColor(data.color);

        message.channel.send(embed);
    }
}

module.exports = Help;