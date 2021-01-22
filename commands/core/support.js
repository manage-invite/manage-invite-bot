const Command = require("../../structures/Command.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "support",
            enabled: true,
            aliases: [ "s" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message) {
        message.sendT("core/support:CONTENT", {
            discord: Constants.Links.DISCORD
        });
    }

};
