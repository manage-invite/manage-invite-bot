const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class BotInfos extends Command {
    constructor (client) {
        super(client, {
            name: "botinfos",
            enabled: true,
            aliases: [ "stats", "infos" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let guildsCounts = await this.client.shard.fetchClientValues("guilds.size");
        let guildsCount = guildsCounts.reduce((p, count) => p + count);
        let usersCounts = await this.client.shard.fetchClientValues("users.size");
        let usersCount = usersCounts.reduce((p, count) => p + count);
        
        let results = await this.client.shard.broadcastEval(() => {
            return [
                Math.round((process.memoryUsage().heapUsed / 1024 / 1024)),
                this.guilds.size,
                this.shard.ids[0],
                Math.round(this.ws.ping)
            ];
        });

        let embed = new Discord.MessageEmbed()
        .setColor(data.color)
        .setFooter(data.footer)
        .setAuthor(this.client.user.username+"'s stats")
        .addField("📊 Statistics", "`Servers: "+guildsCount+"`\n`Users: "+usersCount+"`" , true)
        .addField("⚙️ Versions", "`Discord.js: v"+Discord.version+"`\n`Nodejs: v"+process.versions.node+"`" , true)
        .addBlankField();
        results.forEach((shard) => {
            let title = this.client.config.emojis.online+" Shard #"+(shard[2]+1) + (this.client.shard.ids.includes(shard[2]) ? " (current)" : "");
            embed.addField(title, "`"+shard[0]+"` mb ram\n`"+shard[1]+"` servers\n`"+shard[3]+"` ms", true);
        });

        message.channel.send(embed);
    }

};

module.exports = BotInfos;