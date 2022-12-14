const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "restoreinvites",
            enabled: true,
            aliases: [ "resinvites", "restoreinv", "resinv", "restoreinvite", "restore-invites", "restore-invite" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Restore the invites of the server"
            }
        });
    }

    async runInteraction (interaction, data) {

        let memberCount = { regular: 0, leaves: 0, fake: 0, bonus: 0 };
        await interaction.reply({ content: interaction.guild.translate("misc:PLEASE_WAIT", {
            loading: Constants.Emojis.LOADING
        }) });
        memberCount = await this.client.database.countGuildInvites(interaction.guild.id, interaction.guild.settings.storageID);
        if (!memberCount) {
            return interaction.editReply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("admin/restoreinvites:NO_BACKUP") });
        }

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

        await interaction.editReply({ content: interaction.guild.translate("admin/restoreinvites:CONFIRMATION", {
            prefix: interaction.guild.settings.prefix,
            regular: memberCount.regular,
            leaves: memberCount.leaves,
            bonus: memberCount.bonus,
            fake: memberCount.fake
        }), components: [confirmRow] });
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) => i.customId.endsWith(randomID),
            time: 90000
        });

        collector.on("collect", async (component) => {

            const action = component.customId.split("_")[0];

            if (action === "confirm") {
                await interaction.editReply("admin/restoreinvites:LOADING", {
                    loading: Constants.Emojis.LOADING
                }, true);
    
                await this.client.database.restoreGuildInvites(interaction.guild.id, interaction.guild.settings.storageID);
    
                const embed = new Discord.MessageEmbed()
                    .setAuthor({
                        name: interaction.guild.translate("admin/restoreinvites:TITLE")
                    })
                    .setDescription(interaction.guild.translate("admin/restoreinvites:DESCRIPTION", {
                        success: Constants.Emojis.SUCCESS
                    }))
                    .setColor(data.color)
                    .setFooter({ text: data.footer });
    
                interaction.editReply({ content: null, embeds: [embed], components: [] });

            } else if (action === "cancel") {
                interaction.editReply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("common:CANCELLED"), components: [] });
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
