const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

const languages = [
    {
        name: "french",
        aliases: [
            "francais",
            "fr",
            "français"
        ]
    },
    {
        name: "english",
        aliases: [
            "en",
            "englich"
        ]
    }
];

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
        if(!languages.some((l) => l.name === language || l.aliases.includes(language))){
            return message.error("config/setlang:INVALID");
        }
        await data.guild.setLanguage(languages.find((l) => l.name === language || l.aliases.includes(language)).name);
        message.success("config/setlang:SUCCESS");
    }
};
