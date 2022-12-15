const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");
const Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "set-fake-threshold",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Sets the number of days before a member is considered a fake.",
                options: [
                    {
                        name: "set",
                        description: "Add or change the threshold",
                        type: Discord.ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: "days",
                                description: "The number of days before a member is considered a fake.",
                                type: Discord.ApplicationCommandOptionType.Integer,
                                required: true
                            }
                        ]
                    },
                    {
                        name: "disable",
                        description: "Disable the threshold",
                        type: Discord.ApplicationCommandOptionType.Subcommand
                    }
                ]
            }
        });
    }

    async runInteraction (interaction) {

        const action = interaction.options.getSubcommand();

        if (action === "disable") {
            await this.client.database.updateGuildSetting(interaction.guild.id, "fakeThreshold", null);
            interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/set-fake-threshold:DISABLED") });
        } else if (action === "set") {
            const dayCount = interaction.options.getInteger("days");
            await this.client.database.updateGuildSetting(interaction.guild.id, "fakeThreshold", dayCount);
            interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/set-fake-threshold:UPDATED", {
                dayCount
            }) });
        }
    }
};
