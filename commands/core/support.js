const { PermissionFlagsBits } = require("discord.js");
const Command = require("../../structures/Command.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "support",
            enabled: true,
            clientPermissions: [ PermissionFlagsBits.EmbedLinks ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Get the link to the support server"
            }
        });
    }

    async runInteraction (interaction) {
        interaction.reply({ content: interaction.guild.translate("core/support:CONTENT", {
            discord: Constants.Links.DISCORD
        }) });
    }

};
