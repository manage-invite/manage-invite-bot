const { ButtonStyle } = require("discord.js");
const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "removeinvites",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Remove all the server invites"
            }
        });
    }

    async runInteraction (interaction, data) {

        const randomID = Math.random().toString(36).substr(2, 9);
        
        const confirmRow = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(interaction.guild.translate("common:CONFIRM"))
                    .setCustomId(`confirm_${randomID}`),
                new Discord.ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(interaction.guild.translate("common:CANCEL"))
                    .setCustomId(`cancel_${randomID}`)
            );

        await interaction.reply({ content: interaction.guild.translate("admin/removeinvites:CONFIRMATION"), components: [confirmRow] });
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) => i.customId.endsWith(randomID),
            time: 90000
        });

        collector.on("collect", async (component) => {

            const action = component.customId.split("_")[0];

            if (action === "confirm") {

                await interaction.editReply({ content: interaction.guild.translate("admin/removeinvites:LOADING", {
                    loading: Constants.Emojis.LOADING,
                    prefix: interaction.guild.settings.prefix
                }), components: [] });
        
                await this.client.database.removeGuildInvites(interaction.guild.id);
        
                const embed = new Discord.EmbedBuilder()
                    .setAuthor({
                        name: interaction.guild.translate("admin/removeinvites:TITLE")
                    })
                    .setDescription(interaction.guild.translate("admin/removeinvites:DESCRIPTION", {
                        success: Constants.Emojis.SUCCESS
                    }))
                    .setColor(data.color)
                    .setFooter({ text: data.footer });
        
                interaction.editReply({ content: null, embeds: [embed], components: [] });

            } else if (action === "cancel") {
                interaction.editReply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("common:CANCELLED"), components: [] });
                collector.stop();
            }

            component.deferUpdate();

        });

        collector.on("end", (_, reason) => {
            if (reason === "time") {
                interaction.editReply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("common:CANCELLED"), components: [] });
            }
        });

    }

};
