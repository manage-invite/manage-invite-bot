const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class TestDMJoin extends Command {
    constructor (client) {
        super(client, {
            name: "testdmjoin",
            enabled: true,
            aliases: [ "testdm" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
   
        if(!guild.premium){
            return message.channel.send(message.language.joinDM.premium());
        }
        
        let embed = new Discord.MessageEmbed()
            .setTitle(message.language.testdmjoin.title())
            .setDescription(message.language.testdmjoin.description())
            .addField(message.language.testdmjoin.fields.enabled(), (data.guild.joinDM.enabled ? message.language.testdmjoin.enabled(data.guild.prefix) : message.language.testdmjoin.disabled(data.guild.prefix)))
            .addField(message.language.testdmjoin.fields.message(), (data.guild.joinDM.message || message.language.testdmjoin.notDefineds.message(data.guild.prefix)))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer)
            .setTimestamp()
        message.channel.send(embed);
        
        this.client.emit("guildMemberAdd", message.member, { test: true, type: "dm", invite: {
            inviter: { id: this.client.user.id },
            code: "436SPZX",
            url: "https://discord.gg/436SPZX",
            uses: 1
        }});
    }
}

module.exports = TestDMJoin;