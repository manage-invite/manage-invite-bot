const Command = require("../../structures/Command.js");
const emojis = require("../../emojis.json");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

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
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
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

    async runInteraction (interaction) {
        const newLanguage = interaction.options.getString("language");
        await this.client.database.updateGuildSetting(interaction.guild.id, "language", newLanguage);
        interaction.guild.settings.language = newLanguage;
        interaction.reply(interaction.guild.translate("config/setlang:SUCCESS"));
    }
};
