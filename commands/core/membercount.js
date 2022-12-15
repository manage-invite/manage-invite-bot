const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "membercount",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.AddReactions ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Get the number of members in the server"
            }
        });
    }

    async runInteraction (interaction, data) {

        await interaction.guild.members.fetch();

        const embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: interaction.guild.translate("core/membercount:TITLE", {
                    guild: interaction.guild.name
                })
            })
            .setDescription(
                interaction.guild.translate("core/membercount:TOTAL", {
                    totalCount: interaction.guild.members.cache.size,
                    humanCount: interaction.guild.members.cache.filter((m) => !m.user.bot).size,
                    botCount: interaction.guild.members.cache.filter((m) => m.user.bot).size
                })
            )
            .setColor(data.color)
            .setFooter({ text: data.footer });
        
        interaction.reply({ embeds: [embed] });
    }

};
