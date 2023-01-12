const { ButtonStyle } = require("discord.js");
const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "sync-invites",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageGuild ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Sync invites with the ManageInvite database"
            }
        });
    }

    async runInteraction (interaction, data) {
        await interaction.guild.invites.fetch();
        const guildInvites = interaction.guild.invites.cache;
        if (guildInvites.size === 0) return interaction.reply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("admin/sync-invites:NO_INVITES") });
        const inviteCount = guildInvites.map((i) => i.uses).reduce((p, c) => p + c);

        const randomID = Math.random().toString(36).substring(2, 9);

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

        await interaction.reply({ content: interaction.guild.translate("admin/sync-invites:CONFIRM", { inviteCount }), components: [confirmRow] });
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) => i.customId.endsWith(randomID),
            time: 90000
        });

        collector.on("collect", async (component) => {

            const action = component.customId.split("_")[0];

            if (action === "confirm") {

                const users = new Set(guildInvites.filter((i) => i.inviter).map((i) => i.inviter.id));
                const newStorageID = await this.client.database.removeGuildInvites(interaction.guild.id);
                await this.client.functions.asyncForEach(Array.from(users), async (user) => {
                    const memberData = await this.client.database.fetchGuildMember({
                        userID: user,
                        guildID: interaction.guild.id,
                        storageID: newStorageID
                    });
                    if (memberData.notCreated) await this.client.database.createGuildMember({
                        userID: user,
                        guildID: interaction.guild.id,
                        storageID: newStorageID
                    });
                    await this.client.database.addInvites({
                        userID: user,
                        guildID: interaction.guild.id,
                        storageID: newStorageID,
                        number: guildInvites.filter((i) => i.inviter && i.inviter.id === user).map((i) => i.uses).reduce((p, c) => p + c),
                        type: "regular"
                    });
                });
                const embed = new Discord.EmbedBuilder()
                    .setAuthor({
                        name: interaction.guild.translate("admin/sync-invites:TITLE")
                    })
                    .setDescription(interaction.guild.translate("admin/sync-invites:DESCRIPTION"))
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
