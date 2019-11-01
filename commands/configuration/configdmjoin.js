const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class ConfigDMJoin extends Command {
    constructor (client) {
        super(client, {
            name: "configdmjoin",
            enabled: true,
            aliases: [ "dmjoin", "joindm", "configjoindm", "dm", "configdm" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        let filter = (m) => m.author.id === message.author.id,
        opt = { max: 1, time: 90000, errors: [ "time" ] };
        
        let str = data.guild.joinDM.enabled ? message.language.configdmjoin.disable(data.guild.prefix) : "";
        let msg = await message.channel.send(message.language.configdmjoin.instruct(str));

        let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if(!collected || !collected.first()) return msg.edit(message.language.configdmjoin.cancelled());
        let confMessage = collected.first().content;
        if(confMessage === "cancel") return msg.edit(message.language.configdmjoin.cancelled());
        if(confMessage === data.guild.prefix+"setdmjoin") return;

        msg.edit(message.language.configdmjoin.success());

        let embed = new Discord.MessageEmbed()
            .setTitle(message.language.configdmjoin.title())
            .addField(message.language.configdmjoin.fields.message(), confMessage)
            .addField(message.language.configdmjoin.fields.testIt(), message.language.configdmjoin.fields.cmd(data.guild.prefix))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);

        data.guild.joinDM = { enabled: true, message: confMessage };
        data.guild.markModified("joinDM");
        await data.guild.save();
   }

};

module.exports = ConfigDMJoin;