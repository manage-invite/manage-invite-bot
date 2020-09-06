const Command = require("../../structures/Command.js");

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
        const language = args.join(" ");
        if (!this.client.config.enabledLanguages.some((l) => l.name.toLowerCase() === language.toLowerCase() || (l.aliases.map((a) => a.toLowerCase())).includes(language.toLowerCase()))){
            return message.error("config/setlang:INVALID", {
                list: this.client.config.enabledLanguages.map((l) => `${l.flag} | \`${l.name}\` (${l.aliases[0]})`).join("\n")
            });
        }
        await data.guild.setLanguage(this.client.config.enabledLanguages.find((l) => l.name.toLowerCase() === language.toLowerCase() || (l.aliases.map((a) => a.toLowerCase())).includes(language.toLowerCase())).name);
        message.success("config/setlang:SUCCESS");
    }
};
