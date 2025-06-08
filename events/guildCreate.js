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
        const owner = await guild.fetchOwner().catch(() => null);
        if (knownGuild){
            inviter = await this.client.users.fetch(knownGuild.user).catch(() => null);
        } else {
            if (owner) {
                inviter = owner.user;
            }
        }
        
        await guild.members.fetch(this.client.user.id);
        const me = guild.members.cache.get(this.client.user.id);
        const isValidGuild = me && me.joinedTimestamp > (Date.now() - 20000);

        const guildSettings = await this.client.database.fetchGuildSettings(guild.id);
        const welcomeMessage = `If you want to remove server invites to start over from scratch, you can use \`/remove-invites\`. If you want to synchronize current server invites with the bot, you can use \`/sync-invites\`\n \n**--------------**\n`

        const guildCreate = new Discord.EmbedBuilder()
            .setTitle("Add | :heart:")
            .addFields([
                {
                    name: "Server name :",
                    value: guild.name
                },
                {
                    name: "Owner id :",
                    value: owner ? owner.id : "Unknown"
                },
                {
                    name: "Owner name :",
                    value: inviter ? inviter.username : "Unknown"
                },
                {
                    name: "Server id :",
                    value: guild.id
                },
                {
                    name: "Number of members :",
                    value: guild.memberCount?.toString() || "Unknown"
                }
            ])
            .setFooter({
                text: isValidGuild ? "Add me with /add" : "Guild was just reloaded"
            })
            .setColor(isValidGuild ? Constants.Embed.COLOR : "#000000");

        this.client.shard.broadcastEval((client, guildCreateEmbed) => {
            const aLogs = this.channels.cache.get(client.config.addLogs);
            if (aLogs) aLogs.send({ embeds: [guildCreateEmbed] });
        }, { context: guildCreate });

        if (isValidGuild){

            this.client.guildsCreated++;
            const joinEmbed = new Discord.EmbedBuilder()
                .setTitle("Add | :heart:")
                .setDescription(`Hello ${inviter.username}! Thanks for adding me to your server !\n\n **--------------** `)
                .addFields([
                    {
                        name: "__**INFORMATIONS**__",
                        value: welcomeMessage
                    },
                    {
                        name: "__**HELP**__",
                        value: "If you need some help join the support server!\n \n**--------------**\n"
                    },
                    {
                        name: "__**LINKS**__",
                        value: `> Add the bot [[Click here]](https://discordapp.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=2146958847&scope=bot)\n> Support server  [[Click here]](${this.client.config.discord})\n> Dashboard  [[Click here]](https://manage-invite.xyz) `
                    }
                ])
                .setFooter({
                    text: Constants.Embed.FOOTER
                })
                .setTimestamp()
                .setColor(Constants.Embed.COLOR);
            inviter.send({ embeds: [joinEmbed] });

            /*
            await this.client.wait(5000);
            await guild.invites.fetch().catch(() => {});
            const guildInvites = generateInvitesCache(guild.invites.cache);
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
