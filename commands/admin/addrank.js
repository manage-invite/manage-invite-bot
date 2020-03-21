const Command = require("../../structures/Command.js"),
Discord = require("discord.js"),
stringSimilarity = require("string-similarity");

class Addrank extends Command {
    constructor (client) {
        super(client, {
            name: "addrank",
            enabled: true,
            aliases: [ "ar" ],
            clientPermissions: [ "EMBED_LINKS", "MANAGE_ROLES" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        
        let inviteCount = args[0];
        if(!inviteCount) return message.channel.send(message.language.addrank.errors.inviteCount.missing(data.guild.prefix));
        if(isNaN(inviteCount) || parseInt(inviteCount) < 1 || !Number.isInteger(parseInt(inviteCount))) return message.channel.send(message.language.addrank.errors.inviteCount.incorrect(data.guild.prefix));
        let currentRank = data.guild.ranks.find((r) => r.inviteCount === inviteCount) || {};
        let currentRole = message.guild.roles.cache.find((r) => r.id === currentRank.roleID);
        if(currentRank && currentRole) return message.channel.send(message.language.addrank.errors.inviteCount.alreadyExists(data.guild.prefix, currentRank, currentRole));

        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args.slice(1).join(" ")) || message.guild.roles.cache.find((role) => role.name === args.slice(1).join(" ") || (stringSimilarity.compareTwoStrings(role.name, args.slice(1).join(" ")) > 0.85));
        if(!role || (role.managed && role.members.size === 1 && role.members.first().bot && role.members.first().user.username === role.name)) return message.channel.send(message.language.addrank.errors.role.missing(data.guild.prefix));
        if(role.position > message.guild.me.roles.highest.position) return message.channel.send(message.language.addrank.errors.role.perm(role));
        currentRank = data.guild.ranks.find((r) => r.roleID === role.id);
        if(currentRank) return message.channel.send(message.language.addrank.errors.role.alreadyExists(data.guild.prefix, currentRank, role));

        await data.guild.addRank(role.id, inviteCount);

        let embed = new Discord.MessageEmbed()
        .setAuthor(message.language.addrank.title())
        .setTitle(message.language.utils.conf.title())
        .setURL("https://dash.manage-invite.xyz")
        .setDescription(message.language.addrank.field(data.guild.prefix, role, inviteCount))
        .setColor(data.color)
        .setFooter(data.footer);

        message.channel.send(embed);

    }

};

module.exports = Addrank;