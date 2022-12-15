const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "add",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Add ManageInvite to your server"
            }
        });
    }

    async runInteraction (interaction, data) {

        const embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: "ManageInvite",
                iconURL: this.client.user.displayAvatarURL()
            })
            .setDescription(interaction.guild.translate("core/add:CONTENT", {
                clientID: this.client.user.id
            }))
            .setColor(data.color)
            .setFooter({
                text: interaction.guild.translate("core/add:REQUEST_BY", {
                    username: interaction.user.username
                }),
                iconURL: interaction.user.displayAvatarURL()
            });
        interaction.reply({ embeds: [embed] });

    }

};
