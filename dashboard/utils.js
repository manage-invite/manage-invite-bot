const Discord = require("discord.js");

/**
 * Fetch guild informations
 * @param {string} guildID The ID of the guild to fetch
 * @param {object} client The discord client instance
 * @param {array} guilds The user guilds
 */
async function fetchGuild(guildID, client, locale){
    let results = await client.shard.broadcastEval(`
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
    let guild = results.find((g) => g);
    let conf = await client.database.fetchGuild(guild.id);
    conf.premiumExpiresDisplayed = client.functions.formatDate(new Date(conf.premiumExpiresAt), "MMM DD YYYY", conf.language);
    const difference = new Date(conf.premiumExpiresAt).getTime() - Date.now();
    conf.premiumExpiresDays = Math.round(difference/86400000);
    return { ...guild, ...conf };
}

/**
 * Fetch user informations (stats, guilds, etc...)
 * @param {object} userData The oauth2 user informations
 * @param {object} client The discord client instance
 * @returns {object} The user informations
 */
async function fetchUser(userData, client, locale){
    if(userData.guilds){
        await client.functions.asyncForEach(userData.guilds, async (guild) => {
            let perms = new Discord.Permissions(guild.permissions);
            if(perms.has("MANAGE_GUILD")) guild.admin = true;
            let results = await client.shard.broadcastEval(` let guild = this.guilds.cache.get('${guild.id}'); if(guild && guild.name) guild.toJSON(); `);
            let found = results.find((g) => g);
            guild.settingsUrl = (found ? `/manage/${guild.id}/` : `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=2146958847&guild_id=${guild.id}&response_type=code&redirect_uri=${encodeURIComponent(client.config.baseURL+"/api/callback")}&state=invite${guild.id}`);
            guild.iconURL = (guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : "/dist/img/discordcry.png");
            const guildDB = await client.database.fetchGuild(guild.id);
            guild.isPremium = guildDB.premium;
            guild.isWaitingForVerification = client.waitingForVerification.includes(guild.id);
            guild.trialPeriod = guildDB.trialPeriodEnabled;
        });
        userData.displayedGuilds = userData.guilds.filter((g) => g.admin);
        userData.notAdmin = userData.guilds.filter((g) => !g.admin);
        if(userData.displayedGuilds.length < 1 && userData.notAdmin.length < 1){
            delete userData.displayedGuilds;
        }
    }
    let user = await client.users.fetch(userData.id);
    let userInfos = { ...user.toJSON(), ...userData, ...user.presence };
    return userInfos;
}

module.exports = { fetchUser, fetchGuild };