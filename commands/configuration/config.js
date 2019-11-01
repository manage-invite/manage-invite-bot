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
        && message.guild.channels.get(data.guild.join.channel);

        let joinDMSuccess = data.guild.joinDM.enabled
        && data.guild.joinDM.message;

        let leaveSuccess = data.guild.leave.enabled
        && data.guild.leave.message
        && data.guild.leave.channel
        && message.guild.channels.get(data.guild.leave.channel);

        let embed = new Discord.MessageEmbed()
            .setTitle(`${message.guild.name}'s configuration`)
            .addField(`${(joinSuccess ? this.client.config.emojis.success : this.client.config.emojis.error)} Join Messages`, `
            > Enabled: ${data.guild.join.enabled ? "**yes**" : "**no**"}
            > Message: ${data.guild.join.message ? "**defined**" : "**not defined**."}
            > Channel: ${!data.guild.join.channel ? "**not defined**" : (message.guild.channels.get(data.guild.join.channel) ? "**defined**" : "**channel not found**")}`,
            true)
            .addField(`${(leaveSuccess ? this.client.config.emojis.success : this.client.config.emojis.error)} Leave Messages`, `
            > Enabled: ${data.guild.leave.enabled ? "**yes**" : "**no**"}
            > Message: ${data.guild.leave.message ? "**defined**" : "**not defined**."}
            > Channel: ${!data.guild.leave.channel ? "**not defined**" : (message.guild.channels.get(data.guild.leave.channel) ? "**defined**" : "**channel not found**")}`,
            true)
            .addField(`${(joinDMSuccess ? this.client.config.emojis.success : this.client.config.emojis.error)} Join DM Messages`, `
            > Enabled: ${data.guild.joinDM.enabled ? "**yes**" : "**no**"}
            > Message: ${data.guild.joinDM.message ? "**defined**" : "**not defined**."}`,
            true)
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);
    }
};
          
module.exports = Config;