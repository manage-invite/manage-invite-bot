const Discord = require("discord.js");
const Constants = require("../helpers/constants");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (guild) {

        this.client.guildsDeleted++;

        // Top Stats
        this.client.functions.postTopStats(this.client);

        const user = await this.client.users.fetch(guild.ownerId);

        const guildDelete = new Discord.EmbedBuilder()
            .setTitle("Remove | :broken_heart:")
            .addFields([
                {
                    name: "Server name :",
                    value: guild.name
                },
                {
                    name: "Owner id :",
                    value: user.id
                },
                {
                    name: "Owner name :",
                    value: user.username
                },
                {
                    name: "Server id :",
                    value: guild.id
                },
                {
                    name: "Number of members :",
                    value: guild.memberCount
                }
            ])
            .setColor(Constants.Embed.COLOR);

        this.client.shard.broadcastEval((client, removeLogsEmbed) => {
            const rLogs = this.channels.cache.get(client.config.removeLogs);
            if (rLogs) rLogs.send({ embeds: [removeLogsEmbed] });
        }, { context: guildDelete });
        
    }
};




      

      
