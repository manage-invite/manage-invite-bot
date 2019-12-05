const Discord = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (guild) {

        // Top Stats
        this.client.functions.postTopStats(this.client);

        const guildDelete = JSON.stringify(new Discord.MessageEmbed()
        .setTitle("Remove | :broken_heart:")
        .addField("Server name :", guild.name) 
        .addField("Owner id :", guild.owner.id)
        .addField("Owner name :", guild.owner.user.username)
        .addField("Server id :", guild.id)
        .addField("Number of members :", guild.memberCount)
        .setColor(this.client.config.color)).replace(/[\/\(\)\']/g, "\\$&");

        let { removeLogs } = this.client.config;
        this.client.shard.broadcastEval(`
            let rLogs = this.channels.get('${removeLogs}');
            if(rLogs) rLogs.send({ embed: JSON.parse('${guildDelete}')});
        `);
        
    }
};




      

      
