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
   
        let embed = new Discord.MessageEmbed()
            .setTitle(":wrench: DM Join system :")
            .setDescription(`If it doesn't work, check the bot permissions or join our [support server](${this.client.config.discord})`)
            .addField("> Enabled:", (data.guild.joinDM.enabled ? `${this.client.config.emojis.success} Join messages in dm enabled. Disable them with \`${data.guild.prefix}setdmjoin\`.` : `${this.client.config.emojis.error} Join messages in dm disabled. Enable them with \`${data.guild.prefix}setdmjoin\`.`))
            .addField("> Message:", (data.guild.joinDM.message || `No message defined. Set it with \`${data.guild.prefix}setdmjoin\`!`))
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