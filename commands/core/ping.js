const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "ping",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Get the bot ping"
            }
        });
    }

    async runInteraction (interaction, data) {
  
        const embed = new Discord.MessageEmbed()
            .setTitle(interaction.guild.translate("core/ping:TITLE"))
            .setColor(data.color)
            .setFooter({ text: data.footer })
            .addField(interaction.guild.translate("core/ping:WEBSOCKET"), `${Math.floor(this.client.ws.ping)} ms`)
            .addField(interaction.guild.translate("core/ping:BOT"), `${Math.floor(Date.now() - interaction.createdTimestamp)} ms`);
        interaction.reply({ embeds: [embed] });
    }
};
