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

    async run (message, data) {

        const embed = new Discord.MessageEmbed()
            .setAuthor("ManageInvite", this.client.user.displayAvatarURL())
            .setDescription(message.translate("core/add:CONTENT", {
                clientID: this.client.user.id
            }))
            .setColor(data.color)
            .setFooter(message.translate("core/add:REQUEST_BY", {
                username: message.author.username
            }), message.author.displayAvatarURL());
        message.channel.send({ embeds: [embed] });

    }

    async runInteraction (interaction, data) {

        const embed = new Discord.MessageEmbed()
            .setAuthor("ManageInvite", this.client.user.displayAvatarURL())
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
