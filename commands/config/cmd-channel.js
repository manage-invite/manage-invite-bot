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
                        type: 1,
                        options: [
                            {
                                name: "channel",
                                description: "The channel to set the command channel to.",
                                type: 7,
                                required: true
                            }
                        ]
                    },
                    {
                        name: "disable",
                        description: "Disable the command channel.",
                        type: 1
                    }
                ]
            }
        });
    }

    async run (message) {
        if (message.mentions.channels.first()){
            await this.client.database.updateGuildSetting(message.guild.id, "cmdChannel", message.mentions.channels.first().id);
            message.success("config/cmd-channel:SUCCESS_ENABLED", {
                channel: message.mentions.channels.first().toString(),
                prefix: message.guild.settings.prefix
            });
        } else {
            if (message.guild.settings.cmdChannel){
                await this.client.database.updateGuildSetting(message.guild.id, "cmdChannel", null);
                message.success("config/cmd-channel:SUCCESS_DISABLED");
            } else {
                message.error("config/cmd-channel:MISSING_CHANNEL");
            }
        }
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
