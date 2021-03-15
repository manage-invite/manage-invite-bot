const Discord = require("discord.js");

/**
 * Fetch guild informations
 * @param {string} guildID The ID of the guild to fetch
 * @param {object} client The discord client instance
 * @param {array} guilds The user guilds
 */
async function fetchGuild (guildID, client, translate){
    const results = await client.shard.broadcastEval(`
    let guild = this.guilds.cache.get('${guildID}');
    if(guild){
        if(guild.name) {
            let toReturn = guild.toJSON();
            toReturn.channels = guild.channels.cache.toJSON();
            toReturn.roles = guild.roles.cache.map((r) => {
                return {
                    name: r.name,
                    hexColor: r.hexColor,
                    id: r.id
                };
            });
            toReturn;
        }
    }
    `);
    const guild = results.find((g) => g);
    const [guildSettings, guildSubscriptions, guildPlugins, guildSubscriptionStatus, guildRanks] = await Promise.all([
        client.database.fetchGuildSettings(guild.id),
        client.database.fetchGuildSubscriptions(guild.id),
        client.database.fetchGuildPlugins(guild.id),
        client.database.fetchGuildSubscriptionStatus(guild.id),
        client.database.fetchGuildRanks(guild.id)
    ]);
    const isPremium = guildSubscriptions.some((sub) => new Date(sub.expiresAt).getTime() > Date.now());
    const premiumExpiresAt = guildSubscriptions.sort((subA, subB) => new Date(subB.expiresAt).getTime() - new Date(subA.expiresAt).getTime())[0];
    const difference = premiumExpiresAt - Date.now();
    const additionalData = {};
    if (guildSubscriptionStatus.isPayPal && !guildSubscriptionStatus.isCancelled) {
        additionalData.premiumInfoMessage = translate("dashboard:PREMIUM_PAYPAL");
    } else {
        additionalData.premiumInfoMessage = translate("dashboard:PREMIUM_EXPIRES", {
            guildID,
            count: Math.round(difference/86400000) > 0 ? Math.round(difference/86400000) : 0,
            date: client.functions.formatDate(new Date(premiumExpiresAt), "MMM DD YYYY", guildSettings.language)
        });
    }
    const formattedGuildPlugins = {};
    guildPlugins.forEach((p) => {
        formattedGuildPlugins[p.pluginName] = p.pluginData;
    });
    console.log(guildPlugins, formattedGuildPlugins)
    return { ...guild, ...guildSettings, ...additionalData, ...formattedGuildPlugins, ranks: guildRanks, isPremium };
}

/**
 * Fetch user informations (stats, guilds, etc...)
 * @param {object} userData The oauth2 user informations
 * @param {object} client The discord client instance
 * @returns {object} The user informations
 */
async function fetchUser (userData, client){
    if (userData.guilds){
        const guildsToFetch = userData.guilds.map((g) => g.id);
        const guildPremiumStatuses = await client.database.fetchGuildsPremiumStatuses(guildsToFetch);
        await client.functions.asyncForEach(userData.guilds, async (guild) => {
            const perms = new Discord.Permissions(guild.permissions);
            if (perms.has("MANAGE_GUILD")) guild.admin = true;
            const results = await client.shard.broadcastEval(` let guild = this.guilds.cache.get('${guild.id}'); if(guild && guild.name) guild.toJSON(); `);
            const found = results.find((g) => g);
            guild.settingsUrl = (found ? `/manage/${guild.id}/` : `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=2146958847&guild_id=${guild.id}&response_type=code&redirect_uri=${encodeURIComponent(client.config.baseURL+"/api/callback")}&state=invite${guild.id}`);
            guild.iconURL = (guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : "/dist/img/discordcry.png");
            const guildDB = guildPremiumStatuses.find((g) => g.guildID === guild.id);
            guild.isPremium = guildDB.isPremium;
            guild.isTrial = guildDB.isTrial;
            guild.isWaitingForVerification = client.waitingForVerification.includes(guild.id);
        });
        userData.displayedGuilds = userData.guilds.filter((g) => g.admin);
        userData.notAdmin = userData.guilds.filter((g) => !g.admin);
        if (userData.displayedGuilds.length < 1 && userData.notAdmin.length < 1){
            delete userData.displayedGuilds;
        }
    }
    const user = await client.users.fetch(userData.id);
    const userInfos = { ...user.toJSON(), ...userData, ...user.presence };
    return userInfos;
}

module.exports = { fetchUser, fetchGuild };