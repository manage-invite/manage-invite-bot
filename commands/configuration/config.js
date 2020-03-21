const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class Config extends Command {
    constructor (client) {
        super(client, {
            name: "config",
            enabled: true,
            aliases: [ "conf", "configuration" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        let joinSuccess = data.guild.join.enabled
        && data.guild.join.message
        && data.guild.join.channel
        && message.guild.channels.cache.get(data.guild.join.channel);

        let joinDMSuccess = data.guild.joinDM.enabled
        && data.guild.joinDM.message;

        let leaveSuccess = data.guild.leave.enabled
        && data.guild.leave.message
        && data.guild.leave.channel
        && message.guild.channels.cache.get(data.guild.leave.channel);

        let embed = new Discord.MessageEmbed()
            .setTitle(message.language.config.title(message.guild.name))
            .addField(message.language.config.join.title(joinSuccess), message.language.config.join.content(message.guild, data), true)
            .addField(message.language.config.leave.title(leaveSuccess), message.language.config.leave.content(message.guild, data), true)
            .addField(message.language.config.joinDM.title(joinDMSuccess), message.language.config.joinDM.content(message.guild, data), true)
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);
    }
};
          
module.exports = Config;
