const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "testleave",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Test if the leave command is working"
            }
        });
    }

    async runInteraction (interaction, data) {

        const guildPlugins = await this.client.database.fetchGuildPlugins(interaction.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "leave")?.pluginData;
   
        const embed = new Discord.EmbedBuilder()
            .setTitle(interaction.guild.translate("config/testleave:TITLE"))
            .setDescription(interaction.guild.translate("config/testleave:DESCRIPTION"))
            .addFields([
                {
                    name: interaction.guild.translate("config/testleave:ENABLED_TITLE"),
                    value: (plugin?.enabled ? interaction.guild.translate("config/testleave:ENABLED_YES_CONTENT", {
                        prefix: interaction.guild.settings.prefix,
                        success: Constants.Emojis.SUCCESS
                    }) : interaction.guild.translate("config/testleave:ENABLED_NO_CONTENT", {
                        prefix: interaction.guild.settings.prefix,
                        success: Constants.Emojis.SUCCESS
                    }))
                },
                {
                    name: interaction.guild.translate("config/testleave:MESSAGE"),
                    value: (plugin?.mainMessage || interaction.guild.translate("config/testleave:ENABLED_YES_CONTENT", {
                        prefix: interaction.guild.settings.prefix
                    }))
                },
                {
                    name: interaction.guild.translate("config/testleave:CHANNEL_TITLE"),
                    value: (plugin?.channel ? `<#${plugin.channel}>` : interaction.guild.translate("config/testleave:CHANNEL_CONTENT", {
                        prefix: interaction.guild.settings.prefix
                    }))
                }
            ])
            .setThumbnail(interaction.user.avatarURL())
            .setColor(data.color)
            .setFooter({ text: data.footer })
            .setTimestamp();
        interaction.reply({ embeds: [embed] });
        
        if (plugin?.enabled && plugin.mainMessage && plugin.channel && interaction.guild.channels.cache.get(plugin.channel)){
            interaction.guild.channels.cache.get(plugin.channel).send(this.client.functions.formatMessage(
                plugin.mainMessage,
                interaction.member,
                1,
                (interaction.guild.settings.language || "english").substr(0, 2),
                {
                    inviter: this.client.user,
                    inviterData: {
                        regular: 1,
                        fake: 0,
                        bonus: 0,
                        leaves: 0
                    },
                    invite: {
                        code: "436SPZX",
                        url: "https://discord.gg/436SPZX",
                        uses: 1,
                        channel: interaction.channel
                    }
                }                
            )).catch(() => {
                return interaction.editReply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("misc:CANNOT_SEND") });
            });
        }
    }
};
