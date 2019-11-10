const Discord = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (guild) {

        let inviter = null;

        // Wait 2 seconds to be sure that a request have been sent to the dashboard
        await this.client.wait(2000);
        let knownGuild = this.client.knownGuilds.find((g) => g.id === guild.id);
        if(knownGuild){
            inviter = await this.client.users.fetch(knownGuild.user);
        } else {
            inviter = await this.client.users.fetch(guild.ownerID);
        }

        let guildData = await this.client.guildsData.findOne({ id: guild.id });
        let welcomeMessage = "My prefix is `+`. If you want to remove server invites to start over from scratch, you can use `+remove-invites`.\n \n**--------------**\n";
        if(!guildData){
            guildData = await this.client.findOrCreateGuild({ id: guild.id });
            let guildInvites = await message.guild.fetchInvites();
            let users = new Set(guildInvites.map((i) => i.inviter.id));
            await this.client.functions.asyncForEach(Array.from(users), async (user) => {
                let memberData = await this.client.findOrCreateGuildMember({ id: user, guildID: guild.id });
                memberData.invites = guildInvites.filter((i) => i.inviter.id === user).map((i) => i.uses).reduce((p, c) => p + c);
                await memberData.save();
            });
        } else {
            welcomeMessage = `My prefix is \`${guildData.prefix}\`. If you want to remove server invites to start over from scratch, you can use \`${guildData.prefix}remove-invites\`. If you want to synchronize current server invites with the bot, you can use \`${guildData.prefix}sync-invites\`\n \n**--------------**\n`
        }

        const guildCreate = JSON.stringify(new Discord.MessageEmbed()
        .setTitle("Add | :heart:")
        .addField("Server name :", guild.name) 
        .addField("Owner id :", guild.owner.id)
        .addField("Owner name :", inviter.username)
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
        .setDescription(`Hello ${inviter.username}! Thanks for adding me to your server !\n\n **--------------** `)
        .addField("__**INFORMATIONS**__", )
        .addField("__**HELP**__", "If you need some help join the support server !\n \n**--------------**\n")
        .addField("__**LINKS**__", `> Add the bot [[Click here]](https://discordapp.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=2146958847&scope=bot)\n> Support server  [[Click here]](${this.client.config.discord})\n> Dashboard  [[Click here]](${this.client.config.baseURL}) `)
        .setFooter(this.client.config.footer)
        .setTimestamp()
        .setColor(this.client.config.color)
    
        inviter.send(joinEmbed);
    }
};