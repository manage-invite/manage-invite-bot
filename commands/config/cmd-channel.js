const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");
const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "cmd-channel",
            enabled: true,
            aliases: [ "cmdchannel" ],
            clientPermissions: [ "EMBED_LINKS", "MANAGE_MESSAGES" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Enable or disable the command channel.",
                options: [
                    {
                        name: "set",
                        description: "Enable or change the command channel",
                        type: ApplicationCommandOptionTypes.SUB_COMMAND,
                        options: [
                            {
                                name: "channel",
                                description: "The channel to set the command channel to.",
                                type: ApplicationCommandOptionTypes.CHANNEL,
                                required: true
                            }
                        ]
                    },
                    {
                        name: "disable",
                        description: "Disable the command channel.",
                        type: ApplicationCommandOptionTypes.SUB_COMMAND
                    }
                ]
            }
        });
    }

    async runInteraction (interaction) {

        const action = interaction.options.getSubCommand();

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
