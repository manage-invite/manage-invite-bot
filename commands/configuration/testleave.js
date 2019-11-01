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
            .setTitle(":wrench: Leave system :")
            .setDescription(`If it doesn't work, check the bot permissions or join our [support server](${this.client.config.discord})`)
            .addField("> Enabled:", (data.guild.leave.enabled ? `${this.client.config.emojis.success} Leave messages enabled. Disable them with \`${data.guild.prefix}setleave\`.` : `${this.client.config.emojis.error} Leave messages disabled. Enable them with \`${data.guild.prefix}setleave\`.`))
            .addField("> Message:", (data.guild.leave.message || `No message defined. Set it with \`${data.guild.prefix}setleave\`!`))
            .addField("> Channel:", (data.guild.leave.channel ? `<#${data.guild.leave.channel}>` : `No channel defined. Set it with \`${data.guild.prefix}setleave\`!`))
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer)
            .setTimestamp()
        message.channel.send(embed);
        
        this.client.emit("guildMemberRemove", message.member, { test: true, invite: {
          inviter: { id: this.client.user.id },
          code: "436SPZX",
          url: "https://discord.gg/436SPZX",
          uses: 1
        }});
    }
}

module.exports = TestLeave;