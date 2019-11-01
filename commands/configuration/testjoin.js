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
            .setTitle(":wrench: Join system :")
            .setDescription(`If it doesn't work, check the bot permissions or join our [support server](${this.client.config.discord})`)
            .addField("> Enabled:", (data.guild.join.enabled ? `${this.client.config.emojis.success} Join messages enabled. Disable them with \`${data.guild.prefix}setjoin\`.` : `${this.client.config.emojis.error} Join messages disabled. Enable them with \`${data.guild.prefix}setjoin\`.`))
            .addField("> Message:", (data.guild.join.message || `No message defined. Set it with \`${data.guild.prefix}setjoin\`!`))
            .addField("> Channel:", (data.guild.join.channel ? `<#${data.guild.join.channel}>` : `No channel defined. Set it with \`${data.guild.prefix}setjoin\`!`))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer)
            .setTimestamp()
        message.channel.send(embed);
        
        this.client.emit("guildMemberAdd", message.member, { test: true, type: "simple", invite: {
          inviter: { id: this.client.user.id },
          code: "436SPZX",
          url: "https://discord.gg/436SPZX",
          uses: 1
        }});
    }
}

module.exports = TestJoin;