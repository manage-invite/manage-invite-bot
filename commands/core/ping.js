const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "ping",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Get the bot ping"
            }
        });
    }

    async runInteraction (interaction, data) {
  
        const embed = new Discord.EmbedBuilder()
            .setTitle(interaction.guild.translate("core/ping:TITLE"))
            .setColor(data.color)
            .setFooter({ text: data.footer })
            .addFields([
                {
                    name: interaction.guild.translate("core/ping:WEBSOCKET"),
                    value: `${Math.floor(this.client.ws.ping)} ms`
                },
                {
                    name: interaction.guild.translate("core/ping:BOT"),
                    value: `${Math.floor(Date.now() - interaction.createdTimestamp)} ms`
                }
            ]);
        interaction.reply({ embeds: [embed] });
    }
};
