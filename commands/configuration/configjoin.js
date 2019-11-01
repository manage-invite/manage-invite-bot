const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class ConfigJoin extends Command {
    constructor (client) {
        super(client, {
            name: "configjoin",
            enabled: true,
            aliases: [ "join", "joinconfig" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        let filter = (m) => m.author.id === message.author.id,
        opt = { max: 1, time: 90000, errors: [ "time" ] };
        
        let str = data.guild.join.enabled ? "Type `"+data.guild.prefix+"setjoin` to disable join messages." : "";
        let msg = await message.channel.send(`
__**More informations**__
\`\`\`
{user} : The mention of the member that just joined your server.
{user.name} : The name of the member that just joined your server.
{user.tag} : The tag of the member that just joined your server.
{user.createdat} : The account age of the member.

{guild} : Name of the server.
{guild.count} : Number of members your server has now.

{inviter} : The mention of the inviter.
{inviter.name} : The name of the inviter.
{inviter.tag} : The tag of the inviter.
{inviter.invites} : The total inviter's invites count.

{invite.code} : The invite code used.
{invite.url} : The invite url used.
{invite.uses} : Number of invites with the code invite used.
\`\`\`
Type \`cancel\` to abort. ${str}


:pencil: **| Now write the join message... :pencil2:**
        `);

        let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if(!collected || !collected.first()) return msg.edit(":x: Cancelled.");
        let confMessage = collected.first().content;
        if(confMessage === "cancel") return msg.edit(":x: Cancelled.");
        if(confMessage === data.guild.prefix+"setjoin") return;
        collected.first().delete();

        msg.edit(":scroll: **| Now write the join channel name or mention it... :pencil2:**");

        collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        if(!collected || !collected.first()) return msg.edit(":x: Cancelled.");
        let confChannel = collected.first();
        if(confChannel.content === "cancel") return msg.edit(":x: Cancelled.");
        let channel = confChannel.mentions.channels.first()
        || message.guild.channels.get(confChannel.content)
        || message.guild.channels.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
        if(!channel) return msg.edit(":x: No channel found for `"+confChannel.content+"`");
        collected.first().delete();

        msg.edit("✅ **| Done successfully..  **");

        let embed = new Discord.MessageEmbed()
            .setTitle("**Done The join Msg Has Been Setup**")
            .addField("Message :", confMessage)
            .addField("Channel :", channel)
            .addField("Test it", "Use `"+data.guild.prefix+"testjoin` to test the new message.")
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter(data.footer);
        message.channel.send(embed);

        data.guild.join = { enabled: true, message: confMessage, channel: channel.id };
        data.guild.markModified("join");
        await data.guild.save();

    }
}

module.exports = ConfigJoin;