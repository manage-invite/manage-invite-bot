const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setlang",
            enabled: true,
            aliases: [ "setlanguage", "configlanguage" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        const language = args[0];
        if(!this.client.config.enabledLanguages.some((l) => l.name.toLowerCase() === language.toLowerCase() || l.aliases.includes(language.toLowerCase()))){
            return message.error("config/setlang:INVALID");
        }
        await data.guild.setLanguage(this.client.config.enabledLanguages.find((l) => l.name.toLowerCase() === language.toLowerCase() || l.aliases.includes(language.toLowerCase())).name);
        message.success("config/setlang:SUCCESS");
    }
};
