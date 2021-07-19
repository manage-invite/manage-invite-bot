const Command = require("../../structures/Command.js");
const emojis = require("../../emojis.json");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setlang",
            enabled: true,
            aliases: [ "setlanguage", "configlanguage" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Change the language of the guild",
                options: [
                    {
                        name: "language",
                        type: 3,
                        description: "The new guild language",
                        choices: client.enabledLanguages.map((language) => ({
                            name: `${language.aliases[0]} ${emojis.find((e) => e.name === language.flag).unicode}`,
                            value: language.name
                        }))
                    }
                ]
            }
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

    async runInteraction (interaction) {
        const newLanguage = interaction.options.getString("language");
        await this.client.database.updateGuildSetting(interaction.guild.id, "language", newLanguage);
        interaction.guild.settings.language = newLanguage;
        interaction.reply(interaction.guild.translate("config/setlang:SUCCESS"));
    }
};
