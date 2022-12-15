const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "botinfos",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Shows information about ManageInvite"
            }
        });
    }

    async fetchShardsData () {
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
        return {
            guildsCount,
            usersCount,
            results
        };
    }

    async runInteraction (interaction, data) {

        const { guildsCount, usersCount, results } = await this.fetchShardsData();

        const embed = new Discord.EmbedBuilder()
            .setColor(data.color)
            .setFooter({ text: data.footer })
            .setAuthor({
                name: interaction.guild.translate("core/botinfos:TITLE", {
                    username: this.client.user.username
                })
            })
            .addFields([
                {
                    name: interaction.guild.translate("core/botinfos:STATS_TITLE"),
                    value: interaction.guild.translate("core/botinfos:STATS_CONTENT", {
                        guilds: guildsCount,
                        users: usersCount,
                        keys: await this.client.database.redis.getStats()
                    }),
                    inline: true
                },
                {
                    name: interaction.guild.translate("core/botinfos:VERSIONS_TITLE"),
                    value: interaction.guild.translate("core/botinfos:VERSIONS_CONTENT", {
                        discord: Discord.version,
                        node: process.version
                    }),
                    inline: true
                },
                {
                    name: "\u200B",
                    value: "\u200B"
                }
            ]);
        results.forEach((shard) => {
            const title = interaction.guild.translate(`core/botinfos:SHARD_TITLE${this.client.shard.ids.includes(shard[2]) ? "_CURRENT" : ""}`, {
                online: Constants.Emojis.ONLINE,
                shardID: shard[2]+1
            });
            embed.addFields([
                {
                    name: title,
                    value: interaction.guild.translate("core/botinfos:SHARD_CONTENT", {
                        guilds: shard[1],
                        ping: shard[3],
                        ram: shard[0]
                    }),
                    inline: true
                }
            ]);
        });

        interaction.reply({ embeds: [embed] });
    }
        
};
