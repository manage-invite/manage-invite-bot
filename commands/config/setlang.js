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

    async run (message, args) {
        const language = args.join(" ");
        if (!this.client.enabledLanguages.some((l) => l.name.toLowerCase() === language.toLowerCase() || (l.aliases.map((a) => a.toLowerCase())).includes(language.toLowerCase()))){
            return message.error("config/setlang:INVALID", {
                list: this.client.enabledLanguages.map((l) => `${l.flag} | \`${l.name}\` (${l.aliases[0]})`).join("\n")
            });
        }
        const newLanguage = this.client.enabledLanguages.find((l) => l.name.toLowerCase() === language.toLowerCase() || (l.aliases.map((a) => a.toLowerCase())).includes(language.toLowerCase())).name;
        await this.client.database.updateGuildSetting(message.guild.id, "language", newLanguage);
        message.guild.settings.language = newLanguage;
        message.success("config/setlang:SUCCESS");
    }
};
