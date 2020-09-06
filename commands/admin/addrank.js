const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    stringSimilarity = require("string-similarity");

module.exports = class extends Command {
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
        
        const inviteCount = args[0];
        if (!inviteCount) return message.error("admin/addrank:MISSING_COUNT", {
            prefix: data.guild.prefix
        });
        if (isNaN(inviteCount) || parseInt(inviteCount) < 1 || !Number.isInteger(parseInt(inviteCount))) return message.error("admin/addrank:INCORRECT_COUNT", {
            prefix: data.guild.prefix
        });
        let currentRank = data.guild.ranks.find((r) => r.inviteCount === inviteCount) || {};
        const currentRole = message.guild.roles.cache.find((r) => r.id === currentRank.roleID);
        if (currentRank && currentRole) return message.error("admin/addrank:ALREADY_EXIST", {
            prefix: data.guild.prefix,
            count: currentRank.inviteCount,
            roleName: currentRole.name,
            roleID: currentRole.id
        });

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args.slice(1).join(" ")) || message.guild.roles.cache.find((role) => role.name === args.slice(1).join(" ") || (stringSimilarity.compareTwoStrings(role.name, args.slice(1).join(" ")) > 0.85));
        if (!role) return message.error("admin/addrank:MISSING_ROLE", {
            prefix: data.guild.prefix
        });
        if (role.managed || role.id === message.guild.id) return message.error("admin/addrank:MANAGED");
        if (role.position > message.guild.me.roles.highest.position) return message.error("admin/addrank:MISSING_PERM", {
            roleName: role.name
        });
        currentRank = data.guild.ranks.find((r) => r.roleID === role.id);
        if (currentRank) return message.error("admin/addrank:ALREADY_USED", {
            prefix: data.guild.prefix,
            count: currentRank.inviteCount,
            roleID: role.id
        });

        await data.guild.addRank(role.id, inviteCount);

        const embed = new Discord.MessageEmbed()
            .setAuthor(message.translate("admin/addrank:TITLE"))
            .setTitle(message.translate("admin/ranks:VIEW_CONF"))
            .setURL("https://dash.manage-invite.xyz")
            .setDescription(message.translate("admin/addrank:CONTENT", {
                count: inviteCount,
                roleName: role.name
            }))
            .setColor(data.color)
            .setFooter(data.footer);

        message.channel.send(embed);

    }

};
