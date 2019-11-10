const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class Add extends Command {
    constructor (client) {
        super(client, {
            name: "add",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let embed = new Discord.MessageEmbed()
        .setAuthor("ManageInvite", this.client.user.displayAvatarURL())
        .setDescription(message.language.add.content(this.client.user.id))
        .setColor(this.client.config.color)
        .setFooter(message.language.add.requested(message.author.username), message.author.displayAvatarURL());
        message.channel.send(embed);

    }

};

module.exports = Add;