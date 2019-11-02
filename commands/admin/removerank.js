const Command = require("../../structures/Command.js"),
Discord = require("discord.js"),
stringSimilarity = require("string-similarity");

class RemoveRank extends Command {
    constructor (client) {
        super(client, {
            name: "removerank",
            enabled: true,
            aliases: [ "ar" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        
        let role = message.mentions.roles.first() || message.guild.roles.get(args.slice(1).join(" ")) || message.guild.roles.find((role) => role.name === args.slice(1).join(" ") || (stringSimilarity.compareTwoStrings(role.name, args.slice(1).join(" ")) > 0.85));
        if(!role) return message.channel.send(message.language.removerank.errors.role.missing(data.guild.prefix));
        currentRank = data.guild.ranks.find((r) => r.roleID === role.id);
        if(!currentRank) return message.channel.send(message.language.removerank.errors.role.doesntExist(data.guild.prefix, role));

        data.guild.ranks = data.guild.ranks.filter((r) => r.inviteCount !== inviteCount);
        data.guild.markModified("ranks");
        await data.guild.save();

        let embed = new Discord.MessageEmbed()
        .setAuthor(message.language.removerank.title())
        .setDescription(message.language.removerank.field(data.guild.prefix, currentRole, currentRank.inviteCount))
        .setColor(data.color)
        .setFooter(data.footer);

        message.channel.send(embed);

    }

};

module.exports = RemoveRank;