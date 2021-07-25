const Discord = require("discord.js");
const Constants = require("../helpers/constants");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (guild) {

        // Top Stats
        this.client.functions.postTopStats(this.client);

        let inviter = null;

        // Wait 2 seconds to be sure that a request have been sent to the dashboard
        await this.client.wait(2000);
        const knownGuild = this.client.knownGuilds.find((g) => g.id === guild.id);
        if (knownGuild){
            inviter = await this.client.users.fetch(knownGuild.user);
        } else {
            inviter = await this.client.users.fetch(guild.ownerID);
        }
        
        await guild.members.fetch(this.client.user.id);
        const isValidGuild = guild.me.joinedTimestamp > (Date.now() - 20000);

        const guildSettings = await this.client.database.fetchGuildSettings(guild.id);
        const welcomeMessage = guildSettings ?
            `My prefix is \`${guildSettings.prefix || "+"}\`. If you want to remove server invites to start over from scratch, you can use \`${guildSettings.prefix || "+"}remove-invites\`. If you want to synchronize current server invites with the bot, you can use \`${guildSettings.prefix || "+"}sync-invites\`\n \n**--------------**\n`
            : "My prefix is `+`. If you want to remove server invites to start over from scratch, you can use `+remove-invites`.\n \n**--------------**\n";            

        const guildCreate = new Discord.MessageEmbed()
            .setTitle("Add | :heart:")
            .addField("Server name :", guild.name) 
            .addField("Owner id :", guild.ownerID)
            .addField("Owner name :", inviter.username)
            .addField("Server id :", guild.id)
            .addField("Number of members :", guild.memberCount)
            .setFooter(isValidGuild ? "Add me with +add" : "Guild was just reloaded")
            .setColor(isValidGuild ? Constants.Embed.COLOR : "#000000");

        this.client.shard.broadcastEval((client, guildCreateEmbed) => {
            const aLogs = this.channels.cache.get(client.config.addLogs);
            if (aLogs) aLogs.send({ embeds: [guildCreateEmbed] });
        }, { context: guildCreate });

        if (isValidGuild){

            this.client.guildsCreated++;
            const joinEmbed = new Discord.MessageEmbed()
                .setTitle("Add | :heart:")
                .setDescription(`Hello ${inviter.username}! Thanks for adding me to your server !\n\n **--------------** `)
                .addField("__**INFORMATIONS**__", welcomeMessage)
                .addField("__**HELP**__", "If you need some help join the support server!\n \n**--------------**\n")
                .addField("__**LINKS**__", `> Add the bot [[Click here]](https://discordapp.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=2146958847&scope=bot)\n> Support server  [[Click here]](${this.client.config.discord})\n> Dashboard  [[Click here]](${this.client.config.baseURL}) `)
                .setFooter(Constants.Embed.FOOTER)
                .setTimestamp()
                .setColor(Constants.Embed.COLOR);
            inviter.send({ embeds: [joinEmbed] });

            /*
            await this.client.wait(5000);
            await guild.invites.fetch().catch(() => {});
            const guildInvites = this.client.functions.generateInvitesCache(guild.invites.cache);
            this.client.invitations[guild.id] = guildInvites || null;
            if (!guildInvites) return;
            const users = new Set(guildInvites.map((i) => i.inviter.id));
            await this.client.functions.asyncForEach(Array.from(users), async (user) => {
                const newStorageID = await this.client.database.removeGuildInvites(guild.id);
                const memberData = await this.client.database.fetchGuildMember({
                    userID: user,
                    guildID: guild.id,
                    storageID: newStorageID
                });
                if (memberData.notCreated) await this.client.database.createGuildMember({
                    userID: user,
                    guildID: guild.id,
                    storageID: newStorageID
                });
                await this.client.database.addInvites({
                    userID: user,
                    guildID: guild.id,
                    storageID: newStorageID,
                    number: guildInvites.filter((i) => i.inviter.id === user).map((i) => i.uses).reduce((p, c) => p + c),
                    type: "regular"
                });
            });
            */

        }
    }
};
