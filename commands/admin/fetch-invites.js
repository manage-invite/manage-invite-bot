const Command = require("../../structures/Command.js");
const { generateInvitesCache } = require("../../helpers/functions.js");
const Constants = require("../../helpers/constants.js");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "fetch-invites",
            enabled: true,
            clientPermissions: [ PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ManageGuild ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Fetch all invites from the current guild."
            }
        });
    }

    async runInteraction (interaction) {
        await interaction.guild.invites.fetch();
        this.client.invitations[interaction.guild.id] = generateInvitesCache(interaction.guild.invites.cache);
        interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("admin/fetch-invites:SUCCESS") });
    }

};
