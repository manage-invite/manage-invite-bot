const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class ConfigLeave extends Command {
    constructor (client) {
        super(client, {
            name: "configleave",
            enabled: true,
            aliases: [ "leave", "leaveconfig" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        let filter = (m) => m.author.id === message.author.id,
        opt = { max: 1, time: 90000, errors: [ "time" ] };

        let str = data.guild.leave.enabled ? message.language.configleave.disable(data.guild.prefix) : "";
        let msg = await message.channel.send(message.language.configleave.instructs.message(str));

        let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if(!collected || !collected.first()) return msg.edit(message.language.configleave.cancelled());
        let confMessage = collected.first().content;
        if(confMessage === "cancel") return msg.edit(message.language.configleave.cancelled());
        if(confMessage === data.guild.prefix+"setleave") return;
        collected.first().delete();

        msg.edit(message.language.configleave.instructs.channel());

        collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if(!collected || !collected.first()) return msg.edit(message.language.configleave.cancelled());
        let confChannel = collected.first();
        if(confChannel.content === "cancel") return msg.edit(message.language.configleave.cancelled());
        let channel = confChannel.mentions.channels.first()
        || message.guild.channels.cache.get(confChannel.content)
        || message.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
        if(!channel) return msg.edit(message.language.configleave.errors.channelNotFound(confChannel.content));
        collected.first().delete();

        msg.edit(message.language.configleave.success());

        let embed = new Discord.MessageEmbed()
            .setTitle(message.language.configleave.title())
            .addField(message.language.configleave.fields.message(), confMessage)
            .addField(message.language.configleave.fields.channel(), channel)
            .addField(message.language.configleave.fields.testIt(), message.language.configleave.fields.cmd(data.guild.prefix))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);

        data.guild.leave.enabled = true;
        data.guild.leave.message = confMessage;
        data.guild.leave.channel = channel.id;
        await data.guild.leave.updateData();
    }
};
  

module.exports = ConfigLeave;