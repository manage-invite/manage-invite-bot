const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class Help extends Command {
    constructor (client) {
        super(client, {
            name: "help",
            enabled: true,
            aliases: [ "h", "aide" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
   
        let embed = new Discord.MessageEmbed()
            .setTitle("ℹ ManageInvite's Help Page")
            .setDescription(`> ${message.guild.name}'s prefix: **${data.guild.prefix}**`)
            .addField("Join Messages in DM",`
            > **${data.guild.prefix}configdm**: Setup __**join dm**__ messages
            > **${data.guild.prefix}setdm**: Disable/Enable __**join dm**__ messages
            > **${data.guild.prefix}testdm**: Test __**join dm**__ messages`,
            true)
            .addField("Join Messages",`
            > **${data.guild.prefix}configjoin**: Setup __**join**__ messages
            > **${data.guild.prefix}setjoin**: Disable/Enable __**join**__ messages
            > **${data.guild.prefix}testjoin**: Test __**join**__ messages`,
            true)
            .addField("Leave Messages",`
            > **${data.guild.prefix}configleave**: Setup __**leave**__ messages
            > **${data.guild.prefix}setleave**: Disable/Enable __**leave**__ messages
            > **${data.guild.prefix}testleave**: Test __**leave**__ messages`,
            true)
            .addField("Invites", `
            > **${data.guild.prefix}invite (@user)**: Give you the number of invitations you have or the member mentionned.
            > **${data.guild.prefix}leaderboard**: Show the invites leaderboard of the server.`,
            false)
            .addField("ManageInvite", `
            > **${data.guild.prefix}botinfos**: Show informations about ManageInvite.
            > **${data.guild.prefix}ping**: Show the ManageInvite's ping.
            > **${data.guild.prefix}partners**: Show the ManageInvite's partners.
            > **${data.guild.prefix}support**: Join the support server.`)
            .addField("Tip: you can see your configuration with "+data.guild.prefix+"config", `[Add me to your server](https://discordapp.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot) | [Support server](${this.client.config.discord}) | [Vote for me](https://top.gg/bot/${this.client.user.id})`)
            .setThumbnail(message.author.displayAvatarURL())
            .setColor(data.color);

        message.channel.send(embed);
    }
}

module.exports = Help;