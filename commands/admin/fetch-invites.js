const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "fetch-invites",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS", "MANAGE_GUILD" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Fetch all invites from the current guild."
            }
        });
    }

    async run (message) {
        await message.guild.invites.fetch();
        this.client.invitations[message.guild.id] = this.client.functions.generateInvitesCache(message.guild.invites.cache);
        message.success("admin/fetch-invites:SUCCESS");
    }

    async runInteraction (interaction) {
        await interaction.guild.invites.fetch();
        this.client.invitations[interaction.guild.id] = this.client.functions.generateInvitesCache(interaction.guild.invites.cache);
        interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("admin/fetch-invites:SUCCESS") });
    }

};
