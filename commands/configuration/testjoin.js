const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class TestJoin extends Command {
    constructor (client) {
        super(client, {
            name: "testjoin",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
   
        let embed = new Discord.MessageEmbed()
            .setTitle(message.language.testjoin.title())
            .setDescription(message.language.testjoin.description())
            .addField(message.language.testjoin.fields.enabled(), (data.guild.join.enabled ? message.language.testjoin.enabled(data.guild.prefix) : message.language.testjoin.disabled(data.guild.prefix)))
            .addField(message.language.testjoin.fields.message(), (data.guild.join.message || message.language.testjoin.notDefineds.message(data.guild.prefix)))
            .addField(message.language.testjoin.fields.channel(), (data.guild.join.channel ? `<#${data.guild.join.channel}>` : message.language.testjoin.notDefineds.channel(data.guild.prefix)))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer)
            .setTimestamp()
        message.channel.send(embed);
        
        this.client.emit("guilemberAdd", message.member, { test: true, type: "simple", invite: {
          inviter: { id: this.client.user.id },
          code: "436SPZX",
          url: "https://discord.gg/436SPZX",
          uses: 1
        }});
    }
}

module.exports = TestJoin;