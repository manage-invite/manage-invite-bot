const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

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

        const guild = await message.guild.fetch();
        const embed = new Discord.MessageEmbed()
            .setAuthor(message.translate("core/membercount:TITLE", {
                guild: message.guild.name
            }))
            .setDescription(
                message.translate("core/membercount:TOTAL", {
                    totalCount: guild.members.cache.size,
                    humanCount: guild.members.cache.filter((m) => !m.user.bot).size,
                    botCount: guild.members.cache.filter((m) => m.user.bot).size
                }) + "\n" +
            message.translate("core/membercount:DND", {
                emoji: this.client.config.emojis.dnd,
                count: guild.members.cache.filter((m) => m.presence.status === "dnd"  && !m.user.bot).size
            }) + "\n" +
            message.translate("core/membercount:ONLINE", {
                emoji: this.client.config.emojis.online,
                count: guild.members.cache.filter((m) => m.presence.status === "online"  && !m.user.bot).size
            }) + "\n" +
            message.translate("core/membercount:IDLE", {
                emoji: this.client.config.emojis.idle,
                count: guild.members.cache.filter((m) => m.presence.status === "idle"  && !m.user.bot).size
            }) + "\n" +
            message.translate("core/membercount:OFFLINE", {
                emoji: this.client.config.emojis.offline,
                count: guild.members.cache.filter((m) => m.presence.status === "offline"  && !m.user.bot).size
            })
            )
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);
    }

};
