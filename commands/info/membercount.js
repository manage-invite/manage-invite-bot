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
        .setAuthor(message.guild.name+"'s MemberCount")
        .setDescription(`
        Total of **${guild.members.size}**  members (**${guild.members.filter((m) => !m.user.bot).size}** humans and **${guild.members.filter((m) => !m.user.bot).size}** bots)

        ➔ ${this.client.config.emojis.dnd} | ${guild.members.filter((m) => m.presence.status === "dnd"  && !m.user.bot).size} members dnd
        ➔ ${this.client.config.emojis.online} | ${guild.members.filter((m) => m.presence.status === "online" && !m.user.bot).size} members online
        ➔ ${this.client.config.emojis.idle} | ${guild.members.filter((m) => m.presence.status === "idle" && !m.user.bot).size} members idle
        ➔ ${this.client.config.emojis.offline} | ${guild.members.filter((m) => m.presence.status === "offline" && !m.user.bot).size} members offline`,
        )
        .setColor(data.color)
        .setFooter(data.footer);
        message.channel.send(embed);
    }

};

module.exports = MemberCount;