const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    variables = require("../../helpers/variables");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "configdmjoin",
            enabled: true,
            aliases: [ "dmjoin", "joindm", "configjoindm", "dm", "configdm" ],
            clientPermissions: [ "EMBED_LINKS", "ADMINISTRATOR" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        const guildPlugins = await this.client.database.fetchGuildPlugins(message.guild.id);
        const plugin = guildPlugins.find((p) => p.pluginName === "joinDM")?.pluginData;

        const filter = (m) => m.author.id === message.author.id,
            opt = { max: 1, time: 90000, errors: [ "time" ] };
        
        const str = plugin?.enabled ? message.translate("config/configjoindm:DISABLE", {
            prefix: message.guild.settings.prefix
        }) : "";
        const msg = await message.sendT("config/configjoindm:INSTRUCTIONS_1", {
            string: `${str}`,
            variables: variables.filter((v) => !v.ignore).map((variable) => `{${variable.name}} | ${message.translate(`config/configjoin:VARIABLE_${variable.name.toUpperCase()}`)}` + (variable.endPart ? "\n" : "")).join("\n")
        });

        const collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if (!collected || !collected.first()) return msg.error("common:CANCELLED", null, true);
        const confMessage = collected.first().content;
        if (confMessage === "cancel") return msg.error("common:CANCELLED", null, true);
        if (confMessage === message.guild.settings.prefix+"setdmjoin") return;

        msg.sendT("config/configjoindm:SUCCESS", null, true);

        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/configjoindm:TITLE"))
            .addField(message.translate("common:MESSAGE"), confMessage)
            .addField(message.translate("common:TEST_IT"), message.translate("config/configjoindm:TEST", {
                prefix: message.guild.settings.prefix
            }))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send({ embeds: [embed] });

        await this.client.database.updateGuildPlugin(message.guild.id, "joinDM", {
            ...(plugin || {}),
            enabled: true,
            mainMessage: confMessage
        });
    }

};
