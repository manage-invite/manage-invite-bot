const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class Ping extends Command {
    constructor (client) {
        super(client, {
            name: "ping",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
        
        let msg = await message.channel.send(":ping_pong: Pong!");
    
        let embed = new Discord.MessageEmbed()
            .setTitle("🏓 Pong!")
            .setColor(data.color)
            .setFooter(data.footer)
            .addField("💻 | Websocket Ping", `${Math.floor(this.client.ws.ping)} ms`)
            .addField("📟 | Bot Ping", `${Math.floor(msg.createdTimestamp - message.createdTimestamp)} ms`)
        msg.edit(null, { embed });
    }
}

module.exports = Ping;