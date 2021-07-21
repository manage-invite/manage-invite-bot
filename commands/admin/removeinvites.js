const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "removeinvites",
            enabled: true,
            aliases: [ "rinvites", "removeinv", "rinv", "removeinvite", "remove-invites", "remove-invite" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Remove all the server invites"
            }
        });
    }

    async run (message, args, data) {
        
        const confirmRow = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setStyle("SUCCESS")
                    .setLabel(message.translate("common:CONFIRM"))
                    .setCustomId("confirm"),
                new Discord.MessageButton()
                    .setStyle("SECONDARY")
                    .setLabel(message.translate("common:CANCEL"))
                    .setCustomId("cancel")
            );

        const conf = await message.channel.send({ content: message.translate("admin/removeinvites:CONFIRMATION"), components: [confirmRow] });
        const collector = conf.createMessageComponentCollector({
            filter: () => true,
            time: 90000
        });

        collector.on("collect", async (component) => {

            if (component.customId === "confirm") {

                await conf.edit({ content: message.translate("admin/removeinvites:LOADING", {
                    loading: Constants.Emojis.LOADING,
                    prefix: message.guild.settings.prefix
                }), components: [] });
        
                await this.client.database.removeGuildInvites(message.guild.id);
        
                const embed = new Discord.MessageEmbed()
                    .setAuthor(message.translate("admin/removeinvites:TITLE"))
                    .setDescription(message.translate("admin/removeinvites:DESCRIPTION", {
                        success: Constants.Emojis.SUCCESS
                    }))
                    .setColor(data.color)
                    .setFooter(data.footer);
        
                conf.edit({ content: null, embeds: [embed], components: [] });

            } else if (component.customId === "cancel") {
                conf.edit({ content: Constants.Emojis.SUCCESS + " " + message.translate("common:CANCELLED"), components: [] });
                collector.stop();
            }

            component.deferUpdate();

        });

        collector.on("end", (_, reason) => {
            if (reason === "time") {
                conf.edit({ content: Constants.Emojis.ERROR + " " + message.translate("common:CANCELLED"), components: [] });
            }
        });

    }

    async runInteraction (interaction, data) {

        const randomID = Math.random().toString(36).substr(2, 9);
        
        const confirmRow = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setStyle("SUCCESS")
                    .setLabel(interaction.guild.translate("common:CONFIRM"))
                    .setCustomId(`confirm_${randomID}`),
                new Discord.MessageButton()
                    .setStyle("SECONDARY")
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
        
                const embed = new Discord.MessageEmbed()
                    .setAuthor(interaction.guild.translate("admin/removeinvites:TITLE"))
                    .setDescription(interaction.guild.translate("admin/removeinvites:DESCRIPTION", {
                        success: Constants.Emojis.SUCCESS
                    }))
                    .setColor(data.color)
                    .setFooter(data.footer);
        
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
