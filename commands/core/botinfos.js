const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "botinfos",
            enabled: true,
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        const guildsCounts = await this.client.shard.fetchClientValues("guilds.cache.size");
        const guildsCount = guildsCounts.reduce((p, count) => p + count);
        const usersCounts = await this.client.shard.fetchClientValues("users.cache.size");
        const usersCount = usersCounts.reduce((p, count) => p + count);
        
        const results = await this.client.shard.broadcastEval((client) => {
            return [
                Math.round((process.memoryUsage().heapUsed / 1024 / 1024)),
                client.guilds.cache.size,
                client.shard.ids[0],
                Math.round(client.ws.ping)
            ];
        });

        const embed = new Discord.MessageEmbed()
            .setColor(data.color)
            .setFooter(data.footer)
            .setAuthor(message.translate("core/botinfos:TITLE", {
                username: this.client.user.username
            }))
            .addField(message.translate("core/botinfos:STATS_TITLE"), message.translate("core/botinfos:STATS_CONTENT", {
                guilds: guildsCount,
                users: usersCount,
                keys: await this.client.database.redis.getStats()
            }), true)
            .addField(message.translate("core/botinfos:VERSIONS_TITLE"), message.translate("core/botinfos:VERSIONS_CONTENT", {
                discord: Discord.version,
                node: process.version
            }), true)
            .addField("\u200B", "\u200B");
        results.forEach((shard) => {
            const title = message.translate(`core/botinfos:SHARD_TITLE${this.client.shard.ids.includes(shard[2]) ? "_CURRENT" : ""}`, {
                online: Constants.Emojis.ONLINE,
                shardID: shard[2]+1
            });
            embed.addField(title, message.translate("core/botinfos:SHARD_CONTENT", {
                guilds: shard[1],
                ping: shard[3],
                ram: shard[0]
            }), true);
        });

        message.channel.send({ embeds: [embed] });
    }

};
