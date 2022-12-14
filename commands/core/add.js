const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "add",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Add ManageInvite to your server"
            }
        });
    }

    async runInteraction (interaction, data) {

        const embed = new Discord.MessageEmbed()
            .setAuthor({
                name: "ManageInvite",
                iconURL: this.client.user.displayAvatarURL()
            })
            .setDescription(interaction.guild.translate("core/add:CONTENT", {
                clientID: this.client.user.id
            }))
            .setColor(data.color)
            .setFooter(interaction.guild.translate("core/add:REQUEST_BY", {
                username: interaction.user.username
            }), interaction.user.displayAvatarURL());
        interaction.reply({ embeds: [embed] });

    }

};
