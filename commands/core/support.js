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
        message.channel.send(message.language.support.content());
    }

};

module.exports = Support;