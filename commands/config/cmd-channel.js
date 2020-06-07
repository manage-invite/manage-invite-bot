const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "cmd-channel",
            enabled: true,
            aliases: [ "cmdchannel" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        if(message.mentions.channels.first()){
            await data.guild.setCmdChannel(message.mentions.channels.first().id);
            message.success("config/cmd-channel:SUCCESS_ENABLED", {
                channel: message.mentions.channels.first().toString(),
                prefix: data.guild.prefix
            });
        } else {
            if(data.guild.cmdChannel){
                await data.guild.setCmdChannel(null);
                message.success("config/cmd-channel:SUCCESS_DISABLED");
            } else {
                message.error("config/cmd-channel:MISSING_CHANNEL");
            }
        }
    }
};
