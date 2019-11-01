const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class Support extends Command {
    constructor (client) {
        super(client, {
            name: "support",
            enabled: true,
            aliases: [ "s" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
        message.channel.send(":information_source: If you have questions or you need more informations, you can join ManageInvite's Lounge:\n"+this.client.config.discord);
    }

};

module.exports = Support;