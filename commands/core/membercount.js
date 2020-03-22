const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class MemberCount extends Command {
    constructor (client) {
        super(client, {
            name: "membercount",
            enabled: true,
            aliases: [ "m" ],
            clientPermissions: [ "EMBED_LINKS", "ADD_REACTIONS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let guild = await message.guild.fetch();
        let embed = new Discord.MessageEmbed()
        .setAuthor(message.language.membercount.title(message.guild.name))
        .setDescription(message.language.membercount.description(guild))
        .setColor(data.color)
        .setFooter(data.footer);
        message.channel.send(embed);
    }

};

module.exports = MemberCount;