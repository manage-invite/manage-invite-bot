const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

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

        if (!data.guild.premium){
            return message.error("config/setjoindm:PREMIUM");
        }

        const filter = (m) => m.author.id === message.author.id,
            opt = { max: 1, time: 90000, errors: [ "time" ] };
        
        const str = data.guild.joinDM.enabled ? message.translate("config/configjoindm:DISABLE", {
            prefix: data.guild.prefix
        }) : "";
        const msg = await message.sendT("config/configjoindm:INSTRUCTIONS", {
            string: str
        });

        const collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if (!collected || !collected.first()) return msg.error("common:CANCELLED", null, true);
        const confMessage = collected.first().content;
        if (confMessage === "cancel") return msg.error("common:CANCELLED", null, true);
        if (confMessage === data.guild.prefix+"setdmjoin") return;

        msg.sendT("config/configjoindm:SUCCESS", null, true);

        const embed = new Discord.MessageEmbed()
            .setTitle(message.translate("config/configjoindm:TITLE"))
            .addField(message.translate("common:MESSAGE"), confMessage)
            .addField(message.translate("common:TEST_IT"), message.translate("config/configjoindm:TEST", {
                prefix: data.guild.prefix
            }))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);

        data.guild.joinDM.enabled = true;
        data.guild.joinDM.mainMessage = confMessage;
        await data.guild.joinDM.updateData();
    }

};
