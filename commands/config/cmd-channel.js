const Discord = require("discord.js");
const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "cmd-channel",
            enabled: true,
            clientPermissions: [ PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ManageMessages ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Enable or disable the command channel.",
                options: [
                    {
                        name: "set",
                        description: "Enable or change the command channel",
                        type: Discord.ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: "channel",
                                description: "The channel to set the command channel to.",
                                type: Discord.ApplicationCommandOptionType.Channel,
                                required: true
                            }
                        ]
                    },
                    {
                        name: "disable",
                        description: "Disable the command channel.",
                        type: Discord.ApplicationCommandOptionType.Subcommand
                    }
                ]
            }
        });
    }

    async runInteraction (interaction) {

        const action = interaction.options.getSubcommand();

        if (action === "set") {
            const channel = interaction.options.getChannel("channel");
            await this.client.database.updateGuildSetting(interaction.guild.id, "cmdChannel", channel.id);
            interaction.reply({ content: interaction.guild.translate("config/cmd-channel:SUCCESS_ENABLED", {
                channel: channel.toString(),
                prefix: interaction.guild.settings.prefix
            }) });
        } else if (action === "disable") {
            if (interaction.guild.settings.cmdChannel){
                await this.client.database.updateGuildSetting(interaction.guild.id, "cmdChannel", null);
                interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/cmd-channel:SUCCESS_DISABLED") });
            } else {
                interaction.reply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("config/cmd-channel:DISABLE_NO_CHANNEL") });
            }
        }
    }
};
