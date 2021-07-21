const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "testleave",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Test if the leave command is working"
            }
        });
    }

    async run (message, args, data) {

        const guildPlugins = await this.client.database.fetchGuildPlugins(message.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "leave")?.pluginData;
   
        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/testleave:TITLE"))
            .setDescription(message.translate("config/testleave:DESCRIPTION"))
            .addField(message.translate("config/testleave:ENABLED_TITLE"), (plugin?.enabled ? message.translate("config/testleave:ENABLED_YES_CONTENT", {
                prefix: message.guild.settings.prefix,
                success: Constants.Emojis.SUCCESS
            }) : message.translate("config/testleave:ENABLED_NO_CONTENT", {
                prefix: message.guild.settings.prefix,
                success: Constants.Emojis.SUCCESS
            })))
            .addField(message.translate("config/testleave:MESSAGE"), (plugin?.mainMessage || message.translate("config/testleave:ENABLED_YES_CONTENT", {
                prefix: message.guild.settings.prefix
            })))
            .addField(message.translate("config/testleave:CHANNEL_TITLE"), (plugin?.channel ? `<#${plugin.channel}>` : message.translate("config/testleave:CHANNEL_CONTENT", {
                prefix: message.guild.settings.prefix
            })))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer)
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
        
        if (plugin?.enabled && plugin.mainMessage && plugin.channel && message.guild.channels.cache.get(plugin.channel)){
            message.guild.channels.cache.get(plugin.channel).send(this.client.functions.formatMessage(
                plugin.mainMessage,
                message.member,
                1,
                (message.guild.settings.language || "english").substr(0, 2),
                {
                    inviter: message.client.user,
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
                        channel: message.channel
                    }
                }                
            )).catch(() => {
                return message.error("misc:CANNOT_SEND");
            });
        }
    }

    async runInteraction (interaction, data) {

        const guildPlugins = await this.client.database.fetchGuildPlugins(interaction.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "leave")?.pluginData;
   
        const embed = new Discord.MessageEmbed()
            .setTitle(interaction.guild.translate("config/testleave:TITLE"))
            .setDescription(interaction.guild.translate("config/testleave:DESCRIPTION"))
            .addField(interaction.guild.translate("config/testleave:ENABLED_TITLE"), (plugin?.enabled ? interaction.guild.translate("config/testleave:ENABLED_YES_CONTENT", {
                prefix: interaction.guild.settings.prefix,
                success: Constants.Emojis.SUCCESS
            }) : interaction.guild.translate("config/testleave:ENABLED_NO_CONTENT", {
                prefix: interaction.guild.settings.prefix,
                success: Constants.Emojis.SUCCESS
            })))
            .addField(interaction.guild.translate("config/testleave:MESSAGE"), (plugin?.mainMessage || interaction.guild.translate("config/testleave:ENABLED_YES_CONTENT", {
                prefix: interaction.guild.settings.prefix
            })))
            .addField(interaction.guild.translate("config/testleave:CHANNEL_TITLE"), (plugin?.channel ? `<#${plugin.channel}>` : interaction.guild.translate("config/testleave:CHANNEL_CONTENT", {
                prefix: interaction.guild.settings.prefix
            })))
            .setThumbnail(interaction.user.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer)
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
