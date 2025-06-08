const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "help",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Get help with ManageInvite"
            }
        });
    }

    async runInteraction (interaction, data) {
        const language = interaction.guild.settings.language;
        const guildName = interaction.guild.name;
        const prefix = "/"; // Slash commands prefix
        const dashboard = "https://manage-invite.xyz";
        
        const embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: interaction.guild.translate("core/help:TITLE"),
                iconURL: this.client.user.displayAvatarURL()
            })
            .setDescription(interaction.guild.translate("core/help:DESCRIPTION", {
                guildName,
                language,
                prefix
            }) + `\n\n**${interaction.guild.translate("core/help:TIP", { prefix })} ${interaction.guild.translate("core/help:DASHBOARD", { dashboard })}**\n** **`)
            .addFields(
                {
                    name: interaction.guild.translate("core/help:ADMIN_TITLE"),
                    value: interaction.guild.translate("core/help:ADMIN_CONTENT", { prefix }),
                    inline: false
                },
                {
                    name: interaction.guild.translate("core/help:JOIN_DM_TITLE"),
                    value: interaction.guild.translate("core/help:JOIN_DM_CONTENT", { prefix }),
                    inline: false
                },
                {
                    name: interaction.guild.translate("core/help:JOIN_TITLE"),
                    value: interaction.guild.translate("core/help:JOIN_CONTENT", { prefix }),
                    inline: false
                },
                {
                    name: interaction.guild.translate("core/help:LEAVE_TITLE"),
                    value: interaction.guild.translate("core/help:LEAVE_CONTENT", { prefix }),
                    inline: false
                },
                {
                    name: interaction.guild.translate("core/help:INVITES_TITLE"),
                    value: interaction.guild.translate("core/help:INVITES_CONTENT", { prefix }),
                    inline: false
                },
                {
                    name: interaction.guild.translate("core/help:CORE_TITLE"),
                    value: interaction.guild.translate("core/help:CORE_CONTENT", { prefix }),
                    inline: false
                }
            )
            .setColor(Constants.Embed.COLOR);

        return interaction.reply({ embeds: [embed] });
    }
};
