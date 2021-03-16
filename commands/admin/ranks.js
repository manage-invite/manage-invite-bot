const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "ranks",
            enabled: true,
            aliases: [ "ra" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        const guildRanks = await this.client.database.fetchGuildRanks(message.guild.id);
        
        const embed = new Discord.MessageEmbed()
            .setColor(data.color)
            .setFooter(data.footer);

        const ranks = guildRanks.sort((a,b) => b.inviteCount - a.inviteCount);
        if (ranks.length === 0){
            embed.setAuthor(message.translate("admin/ranks:NO_RANK_TITLE"))
                .setDescription(message.translate("admin/ranks:NO_RANK_CONTENT", {
                    prefix: message.guild.settings.prefix
                }));
            return message.channel.send(embed);
        }

        let description = `[${message.translate("admin/ranks:VIEW_CONF")}](${Constants.Links.DASHBOARD})\n\n`;
        ranks.forEach((rank) => {
            const role = message.guild.roles.cache.get(rank.roleID);
            if (!role) return;
            description += message.translate("admin/ranks:RANK", {
                rank: role.toString(),
                invites: rank.inviteCount
            })+"\n";
        });

        embed.setAuthor(message.translate("admin/ranks:TITLE"))
            .setDescription(description);
        message.channel.send(embed);
    }

};
