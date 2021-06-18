const Discord = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (guild) {

        this.client.guildsDeleted++;

        // Top Stats
        this.client.functions.postTopStats(this.client);

        const user = await this.client.users.fetch(guild.ownerID);

        const guildDelete = new Discord.MessageEmbed()
            .setTitle("Remove | :broken_heart:")
            .addField("Server name :", guild.name) 
            .addField("Owner id :", user.id)
            .addField("Owner name :", user.username)
            .addField("Server id :", guild.id)
            .addField("Number of members :", guild.memberCount)
            .setColor(this.client.config.color);

        this.client.shard.broadcastEval((client, removeLogsEmbed) => {
            const rLogs = this.channels.cache.get(client.config.removeLogs);
            if (rLogs) rLogs.send({ embeds: [removeLogsEmbed] });
        }, { context: guildDelete });
        
    }
};




      

      
