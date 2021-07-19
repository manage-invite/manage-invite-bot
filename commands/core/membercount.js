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
                })
            )
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send({ embeds: [embed] });
    }

};
