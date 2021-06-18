const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
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

        await message.guild.members.fetch();
        const embed = new Discord.MessageEmbed()
            .setAuthor(message.translate("core/membercount:TITLE", {
                guild: message.guild.name
            }))
            .setDescription(
                message.translate("core/membercount:TOTAL", {
                    totalCount: message.guild.members.cache.size,
                    humanCount: message.guild.members.cache.filter((m) => !m.user.bot).size,
                    botCount: message.guild.members.cache.filter((m) => m.user.bot).size
                }) + "\n" +
            message.translate("core/membercount:DND", {
                emoji: Constants.Emojis.DND,
                count: message.guild.members.cache.filter((m) => m.presence.status === "dnd"  && !m.user.bot).size
            }) + "\n" +
            message.translate("core/membercount:ONLINE", {
                emoji: Constants.Emojis.ONLINE,
                count: message.guild.members.cache.filter((m) => m.presence.status === "online"  && !m.user.bot).size
            }) + "\n" +
            message.translate("core/membercount:IDLE", {
                emoji: Constants.Emojis.IDLE,
                count: message.guild.members.cache.filter((m) => m.presence.status === "idle"  && !m.user.bot).size
            }) + "\n" +
            message.translate("core/membercount:OFFLINE", {
                emoji: Constants.Emojis.OFFLINE,
                count: message.guild.members.cache.filter((m) => m.presence.status === "offline"  && !m.user.bot).size
            })
            )
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send({ embeds: [embed] });
    }

};
