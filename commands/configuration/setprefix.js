const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class SetPrefix extends Command {
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
        if(!prefix) return message.channel.send(this.client.config.emojis.error+" | You must write a prefix!");
        data.guild.prefix = prefix;
        await data.guild.save();
        message.channel.send(this.client.config.emojis.success+" | Prefix edited!");
    }
};
  

module.exports = SetPrefix;