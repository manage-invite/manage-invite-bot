const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "partners",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
        
        const partners = require("../../partners.json");
        let partner = partners[Math.floor(Math.random() * partners.length)];

        let embed = new Discord.MessageEmbed()
        .setTitle(partner.title)
        .setURL(partner.url)
        .setThumbnail(partner.img)
        .setDescription(partner.text)
        .setFooter(data.footer)
        .setColor(data.color);

        message.channel.send(embed);
    }

};
