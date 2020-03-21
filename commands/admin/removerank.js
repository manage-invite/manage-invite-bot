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
        
        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args.join(" ")) || message.guild.roles.cache.find((role) => role.name === args.join(" ") || (stringSimilarity.compareTwoStrings(role.name, args.join(" ")) > 0.85));
        if(!role) return message.channel.send(message.language.removerank.errors.role.missing(data.guild.prefix));
        let currentRank = data.guild.ranks.find((r) => r.roleID === role.id);
        if(!currentRank) return message.channel.send(message.language.removerank.errors.role.doesntExist());

        await data.guild.removeRank(currentRank.inviteCount);

        let embed = new Discord.MessageEmbed()
        .setAuthor(message.language.removerank.title())
        .setTitle(message.language.utils.conf.title())
        .setURL("https://dash.manage-invite.xyz")
        .setDescription(message.language.removerank.field(data.guild.prefix, role, currentRank.inviteCount))
        .setColor(data.color)
        .setFooter(data.footer);

        message.channel.send(embed);

    }

};

module.exports = RemoveRank;