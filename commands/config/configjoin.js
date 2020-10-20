const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "configjoin",
            enabled: true,
            aliases: [ "join", "joinconfig" ],
            clientPermissions: [ "EMBED_LINKS", "ADMINISTRATOR" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        const filter = (m) => m.author.id === message.author.id,
            opt = { max: 1, time: 90000, errors: [ "time" ] };
        
        const str = data.guild.join.enabled ? message.translate("config/configjoin:DISABLE", {
            prefix: data.guild.prefix
        }) : "";
        const msg = await message.sendT("config/configjoin:INSTRUCTIONS_1", {
            string: str
        });

        let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if (!collected || !collected.first()) return msg.error("common:CANCELLED", null, true);
        const confMessage = collected.first().content;
        if (confMessage.length > 1000) return msg.edit("TheMessage :D");
        if (confMessage === "cancel") return msg.error("common:CANCELLED", null, true);
        if (confMessage === data.guild.prefix+"setjoin") return;
        collected.first().delete();

        msg.sendT("config/configjoin:INSTRUCTIONS_2", null, true);

        collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if (!collected || !collected.first()) return msg.error("common:CANCELLED", null, true);
        const confChannel = collected.first();
        if (confChannel.content === "cancel") return msg.error("common:CANCELLED", null, true);
        const channel = confChannel.mentions.channels.first()
        || message.guild.channels.cache.get(confChannel.content)
        || message.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
        if (!channel) return msg.error("config/configjoin:CHANNEL_NOT_FOUND", {
            channel: confChannel.content
        }, true);
        collected.first().delete();

        msg.sendT("config/configjoindm:SUCCESS", null, true);

        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/configjoin:TITLE"))
            .addField(message.translate("common:MESSAGE"), confMessage)
            .addField(message.translate("common:CHANNEL"), channel)
            .addField(message.translate("common:TEST_IT"), message.translate("config/configjoin:TEST", {
                prefix: data.guild.prefix
            }))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);

        data.guild.join.enabled = true;
        data.guild.join.mainMessage = confMessage;
        data.guild.join.channel = channel.id;
        await data.guild.join.updateData();

    }
};
