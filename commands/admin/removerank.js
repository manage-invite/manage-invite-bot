const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    stringSimilarity = require("string-similarity");

module.exports = class extends Command {
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
        
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args.join(" ")) || message.guild.roles.cache.find((role) => role.name === args.join(" ") || (stringSimilarity.compareTwoStrings(role.name, args.join(" ")) > 0.85));
        if(!role) return message.error("admin/removerank:MISSING", {
            prefix: data.guild.prefix
        });
        const currentRank = data.guild.ranks.find((r) => r.roleID === role.id);
        if(!currentRank) return message.error("admin/removerank:DOESNT_EXIST");

        await data.guild.removeRank(currentRank.inviteCount);

        const embed = new Discord.MessageEmbed()
            .setAuthor(message.translate("admin/removerank:TITLE"))
            .setTitle(message.translate("admin/ranks:VIEW_CONF"))
            .setURL("https://dash.manage-invite.xyz")
            .setDescription(message.translate("admin/removerank:CONTENT", {
                count: currentRank.inviteCount
            }))
            .setColor(data.color)
            .setFooter(data.footer);

        message.channel.send(embed);

    }

};
