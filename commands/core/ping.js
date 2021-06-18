const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
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
        
        const msg = await message.sendT("core/ping:CONTENT");
    
        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("core/ping:TITLE"))
            .setColor(data.color)
            .setFooter(data.footer)
            .addField(message.translate("core/ping:WEBSOCKET"), `${Math.floor(this.client.ws.ping)} ms`)
            .addField(message.translate("core/ping:BOT"), `${Math.floor(msg.createdTimestamp - message.createdTimestamp)} ms`);
        msg.edit({ embeds: [embed] });
    }
};
