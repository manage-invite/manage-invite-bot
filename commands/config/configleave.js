const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "configleave",
            enabled: true,
            aliases: [ "leave", "leaveconfig" ],
            clientPermissions: [ "EMBED_LINKS", "ADMINISTRATOR" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        const filter = (m) => m.author.id === message.author.id,
            opt = { max: 1, time: 90000, errors: [ "time" ] };
        
        const str = data.guild.join.enabled ? message.translate("config/configleave:DISABLE", {
            prefix: data.guild.prefix
        }) : "";
        const msg = await message.sendT("config/configleave:INSTRUCTIONS_1", {
            string: str
        });

        let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if (!collected || !collected.first()) return msg.error("common:CANCELLED", null, true);
        const confMessage = collected.first().content;
        if (confMessage > 2048) return msg.error("config/configleave:CARACTERES2048", null, true);
        if (confMessage === "cancel") return msg.error("common:CANCELLED", null, true);
        if (confMessage === data.guild.prefix+"setleave") return;
        collected.first().delete();

        msg.sendT("config/configleave:INSTRUCTIONS_2", null, true);

        collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if (!collected || !collected.first()) return msg.error("common:CANCELLED", null, true);
        const confChannel = collected.first();
        if (confChannel.content === "cancel") return msg.error("common:CANCELLED", null, true);
        const channel = confChannel.mentions.channels.first()
        || message.guild.channels.cache.get(confChannel.content)
        || message.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
        if (!channel || channel.type === "voice") return msg.error("config/configleave:CHANNEL_NOT_FOUND", {
            channel: confChannel.content
        }, true);
        collected.first().delete();

        msg.sendT("config/configjoindm:SUCCESS", null, true);

        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/configleave:TITLE"))
            .addField(message.translate("common:MESSAGE"), confMessage)
            .addField(message.translate("common:CHANNEL"), channel)
            .addField(message.translate("common:TEST_IT"), message.translate("config/configleave:TEST", {
                prefix: data.guild.prefix
            }))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);

        data.guild.leave.enabled = true;
        data.guild.leave.mainMessage = confMessage;
        data.guild.leave.channel = channel.id;
        await data.guild.leave.updateData();

    }
};
