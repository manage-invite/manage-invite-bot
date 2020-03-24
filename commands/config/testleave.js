const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class TestLeave extends Command {
    constructor (client) {
        super(client, {
            name: "testleave",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
   
        let embed = new Discord.MessageEmbed()
            .setTitle(message.language.testleave.title())
            .setDescription(message.language.testleave.description())
            .addField(message.language.testleave.fields.enabled(), (data.guild.leave.enabled ? message.language.testleave.enabled(data.guild.prefix) : message.language.testleave.disabled(data.guild.prefix)))
            .addField(message.language.testleave.fields.message(), (data.guild.leave.message || message.language.testleave.notDefineds.message(data.guild.prefix)))
            .addField(message.language.testleave.fields.channel(), (data.guild.leave.channel ? `<#${data.guild.leave.channel}>` : message.language.testleave.notDefineds.channel(data.guild.prefix)))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer)
            .setTimestamp()
        message.channel.send(embed);
        
        if(data.guild.leave.enabled && data.guild.leave.message && data.guild.leave.channel && message.guild.channels.cache.get(data.guild.leave.channel)){
            message.guild.channels.cache.get(data.guild.leave.channel).send(this.client.functions.formatMessage(
                data.guild.leave.message,
                message.member,
                message.client.user,
                {
                    code: "436SPZX",
                    url: "https://discord.gg/436SPZX",
                    uses: 1
                },
                (data.guild.language || "english").substr(0, 2),
                {
                    regular: 1,
                    fake: 0,
                    bonus: 0,
                    leaves: 0
                }
            )).catch(() => {
                return message.channel.send(message.language.errors.sendPerm());
            });
        }
    }
}

module.exports = TestLeave;