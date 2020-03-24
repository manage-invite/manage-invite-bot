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
   
        if(!data.guild.premium){
            return message.channel.send(message.language.joinDM.premium(message.author.username));
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

        if(data.guild.joinDM.enabled && data.guild.joinDM.message){
            message.author.send(this.client.functions.formatMessage(
                data.guild.joinDM.message,
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

module.exports = TestDMJoin;