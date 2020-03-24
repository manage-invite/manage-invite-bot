const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

const Constants = require("../../Constants");

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
        message.sendT("core/support:CONTENT", {
            discord: Constants.Links.DISCORD
        });
    }

};

module.exports = Support;