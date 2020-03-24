const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "add",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message) {

        const embed = new Discord.MessageEmbed()
        .setAuthor("ManageInvite", this.client.user.displayAvatarURL())
        .setDescription(message.translate("core/add:CONTENT", {
            clientID: this.client.user.id
        }))
        .setColor(this.client.config.color)
        .setFooter(message.translate("core/add:REQUESTED_BY", {
            username: message.author.username
        }), message.author.displayAvatarURL());
        message.channel.send(embed);

    }

};
