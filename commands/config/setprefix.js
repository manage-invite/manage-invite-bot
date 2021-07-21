const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setprefix",
            enabled: true,
            aliases: [ "configprefix" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Set the prefix for the bot.",
                options: [
                    {
                        name: "prefix",
                        description: "The new bot's prefix",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true
                    }
                ]
            }
        });
    }

    async run (message, args) {
        const prefix = args[0];
        if (!prefix) return message.error("config/setprefix:MISSING");
        await this.client.database.updateGuildSetting(message.guild.id, "prefix", prefix);
        message.success("config/setprefix:SUCCESS");
    }

    async runInteraction (interaction) {
        const prefix = interaction.options.getString("prefix");
        await this.client.database.updateGuildSetting(interaction.guild.id, "prefix", prefix);
        interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/setprefix:SUCCESS") });
    }
};
