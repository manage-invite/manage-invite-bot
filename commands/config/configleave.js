const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    variables = require("../../helpers/variables"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "configleave",
            enabled: true,
            aliases: [ "leave", "leaveconfig" ],
            clientPermissions: [ "EMBED_LINKS", "ADMINISTRATOR" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Configure leave messages"
            }
        });
    }

    async runInteraction (interaction, data) {

        const guildPlugins = await this.client.database.fetchGuildPlugins(interaction.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "leave")?.pluginData;

        const opt = { filter: (m) => m.author.id === interaction.user.id, max: 1, time: 90000, errors: [ "time" ] };
        
        const str = plugin?.enabled ? interaction.guild.translate("config/configleave:DISABLE", {
            prefix: interaction.guild.settings.prefix
        }) : "";
        await interaction.reply({ content: interaction.guild.translate("config/configleave:INSTRUCTIONS_1", {
            string: `${str}`,
            variables: variables.filter((v) => !v.ignore).map((variable) => `{${variable.name}} | ${interaction.guild.translate(`config/configleave:VARIABLE_${variable.name.toUpperCase()}`)}` + (variable.endPart ? "\n" : "")).join("\n")
        }) });

        let collected = await interaction.channel.awaitMessages(opt).catch(() => {});
        if (!collected || !collected.first()) return interaction.editReply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("common:CANCELLED") });
        const confMessage = collected.first().content;
        if (confMessage === "cancel") return interaction.editReply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("common:CANCELLED") });
        if (confMessage === interaction.guild.settings.prefix+"setleave") return;
        collected.first().delete().catch(() => {});

        interaction.editReply({ content: interaction.guild.translate("config/configleave:INSTRUCTIONS_2") });

        collected = await interaction.channel.awaitMessages(opt).catch(() => {});
        if (!collected || !collected.first()) return interaction.editReply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("common:CANCELLED") });
        const confChannel = collected.first();
        if (confChannel.content === "cancel") return interaction.editReply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("common:CANCELLED") });
        const channel = confChannel.mentions.channels.first()
        || interaction.guild.channels.cache.get(confChannel.content)
        || interaction.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
        if (!channel || channel.type === "voice") return interaction.editReply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("config/configleave:CHANNEL_NOT_FOUND", {
            channel: confChannel.content
        }) });
        collected.first().delete().catch(() => {});

        const embed = new Discord.MessageEmbed()
            .setTitle(interaction.guild.translate("config/configleaven:TITLE"))
            .addField(interaction.guild.translate("common:MESSAGE"), confMessage)
            .addField(interaction.guild.translate("common:CHANNEL"), channel.toString())
            .addField(interaction.guild.translate("common:TEST_IT"), interaction.guild.translate("config/configleave:TEST", {
                prefix: interaction.guild.settings.prefix
            }))
            .setThumbnail(interaction.user.avatarURL())
            .setColor(data.color)
            .setFooter({ text: data.footer });

        interaction.editReply({ content: interaction.guild.translate("config/configleavedm:SUCCESS"), embeds: [embed] });

        await this.client.database.updateGuildPlugin(interaction.guild.id, "leave", {
            ...(plugin || {}),
            enabled: true,
            mainMessage: confMessage,
            channel: channel.id
        });

    }
};
