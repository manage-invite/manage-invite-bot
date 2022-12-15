const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "my-codes",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Get your invite codes"
            }
        });
    }

    async runInteraction (interaction, data) {
        const blacklistedUsers = await this.client.database.fetchGuildBlacklistedUsers(interaction.guild.id);
        if (blacklistedUsers.includes(interaction.user.id)) {
            return interaction.reply({ content: interaction.guild.translate("admin/blacklist:AUTHOR_BLACKLISTED"), ephemeral: true });
        }

        const invites = await interaction.guild.invites.fetch();

        const user = interaction.user;

        const userInvites = invites.filter((i) => i.inviterId === user.id).sort((a, b) => b.uses - a.uses);

        const embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: user.tag,
                iconURL: user.displayAvatarURL()
            })
            .setDescription(userInvites.size > 0 ? userInvites.map((invite) => `<#${invite.channelId}> | ${invite.uses} uses`).join("\n") : `${interaction.guild.translate("core/codes:NO_CODE")}`)
            .setColor(data.color)
            .setFooter({
                text: userInvites.size > 0 ? `Total: ${userInvites.map((invite) => invite.uses).reduce((p, c) => p + c)} uses` : data.footer
            });

        interaction.reply({ embeds: [embed] });
    }

};
