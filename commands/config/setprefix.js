const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setprefix",
            enabled: true,
            aliases: [ "configprefix" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        let prefix = args[0];
        if(!prefix) return message.error("config/setprefix:MISSING");
        await data.guild.setPrefix(prefix);
        message.success("config/setprefix:SUCCESS");
    }
};
