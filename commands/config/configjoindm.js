const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "configdmjoin",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.Administrator ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Configure join DM messages"
            }
        });
    }

    async runInteraction (interaction) {

        return interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                .setDescription("This command has been replaced by a more powerful and **[new dashboard UI, easier to use!](https://manage-invite.xyz)**")
                .setColor(Constants.Embed.COLOR)
            ]
        });

        /*

        const guildPlugins = await this.client.database.fetchGuildPlugins(interaction.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "joinDM")?.pluginData;

        const opt = { filter: (m) => m.author.id === interaction.user.id, max: 1, time: 90000, errors: [ "time" ] };
        
        const str = plugin?.enabled ? interaction.translate("config/configjoindm:DISABLE", {
            prefix: interaction.guild.settings.prefix
        }) : "";
        await interaction.reply({ content: interaction.guild.translate("config/configjoindm:INSTRUCTIONS_1", {
            string: `${str}`,
            variables: variables.filter((v) => !v.ignore).map((variable) => `{${variable.name}} | ${interaction.guild.translate(`config/configjoin:VARIABLE_${variable.name.toUpperCase()}`)}` + (variable.endPart ? "\n" : "")).join("\n")
        }) });

        const collected = await interaction.channel.awaitMessages(opt).catch(() => {});
        if (!collected || !collected.first()) return interaction.editReply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("common:CANCELLED") });
        const confMessage = collected.first().content;
        if (confMessage === "cancel") return interaction.editReply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("common:CANCELLED") });
        if (confMessage === interaction.guild.settings.prefix+"setdmjoin") return;

        const embed = new Discord.EmbedBuilder()
            .setTitle(interaction.guild.translate("config/configjoindm:TITLE"))
            .addFields([
                {
                    name: interaction.guild.translate("common:MESSAGE"),
                    value: confMessage
                },
                {
                    name: interaction.guild.translate("common:TEST_IT"),
                    value: interaction.guild.translate("config/configjoindm:TEST", {
                        prefix: interaction.guild.settings.prefix
                    })
                }
            ])
            .setThumbnail(interaction.user.avatarURL())
            .setColor(data.color)
            .setFooter({ text: data.footer });

        interaction.editReply({ content: interaction.guild.translate("config/configjoindm:SUCCESS"), embeds: [embed] });

        await this.client.database.updateGuildPlugin(interaction.guild.id, "joinDM", {
            ...(plugin || {}),
            enabled: true,
            mainMessage: confMessage
        });*/

    }

};
