const Discord = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (guild) {

        const guildCreate = JSON.stringify(new Discord.MessageEmbed()
        .setTitle("Add | :heart:")
        .addField("Server name :", guild.name) 
        .addField("Owner id :", guild.owner.id)
        .addField("Owner name :", guild.owner.user.username)
        .addField("Server id :", guild.id)
        .addField("Number of members :", guild.memberCount)
        .setColor(this.client.config.color)).replace(/[\/\(\)\']/g, "\\$&");

        let { addLogs } = this.client.config;
        this.client.shard.broadcastEval(`
            let aLogs = this.channels.get('${addLogs}');
            if(aLogs) aLogs.send({ embed: JSON.parse('${guildCreate}')});
        `);

        let joinEmbed = new Discord.MessageEmbed()
        .setTitle("Add | :heart:")
        .setDescription(`Hello ${guild.owner.user.username} ! Thanks for adding me to your server !\n\n **--------------** `)
        .addField("__**INFORMATIONS**__", "My prefix is ``+``  \n \n**--------------**\n")
        .addField("__**HELP**__", "If you need some help join the server support !\n \n**--------------**\n")
        .addField("__**LINKS**__", `> Add the bot [[Click here]](https://discordapp.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot)\n> Server support  [[Click here]](${this.client.config.discord}) `)
        .setFooter("Bot made by Androz2091")
        .setTimestamp()
        .setColor(this.client.config.color)
    
        guild.owner.send(joinEmbed);
    }
};