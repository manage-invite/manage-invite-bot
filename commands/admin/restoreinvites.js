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

    async run (message, args, data) {

        let memberCount = { regular: 0, leaves: 0, fake: 0, bonus: 0 };
        const m = await message.sendT("misc:PLEASE_WAIT", {
            loading: Constants.Emojis.LOADING
        });
        memberCount = await this.client.database.countGuildInvites(message.guild.id, message.guild.settings.storageID);
        if (!memberCount) {
            return message.error("admin/restoreinvites:NO_BACKUP");
        }
        m.delete();

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

        const conf = await message.channel.send({ content: message.translate("admin/restoreinvites:CONFIRMATION", {
            prefix: message.guild.settings.prefix,
            regular: memberCount.regular,
            leaves: memberCount.leaves,
            bonus: memberCount.bonus,
            fake: memberCount.fake
        }), components: [confirmRow] });
        const collector = conf.createMessageComponentCollector({
            filter: () => true,
            time: 90000
        });

        collector.on("collect", async (component) => {

            if (component.customId === "confirm") {
                await conf.sendT("admin/restoreinvites:LOADING", {
                    loading: Constants.Emojis.LOADING
                }, true);
    
                await this.client.database.restoreGuildInvites(message.guild.id, message.guild.settings.storageID);
    
                const embed = new Discord.MessageEmbed()
                    .setAuthor(message.translate("admin/restoreinvites:TITLE"))
                    .setDescription(message.translate("admin/restoreinvites:DESCRIPTION", {
                        success: Constants.Emojis.SUCCESS
                    }))
                    .setColor(data.color)
                    .setFooter(data.footer);
    
                conf.edit({ content: null, embeds: [embed], components: [] });

            } else if (component.customId === "cancel") {
                conf.edit({ content: Constants.Emojis.SUCCESS + " " + message.translate("common:CANCELLED"), components: [] });
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
                    .setAuthor(interaction.guild.translate("admin/restoreinvites:TITLE"))
                    .setDescription(interaction.guild.translate("admin/restoreinvites:DESCRIPTION", {
                        success: Constants.Emojis.SUCCESS
                    }))
                    .setColor(data.color)
                    .setFooter(data.footer);
    
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
