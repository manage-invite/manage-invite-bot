const config = require("../config");

const fetch = require("node-fetch"),
    moment = require("moment"),
    Discord = require("discord.js");

const variables = require("./variables");

const stringOrNull = (string) => string ? `'${string}'` : "null";
const pgEscape = (string) => string ? string.replace(/'/g, "''") : null;

/**
 * @param {array} array The array to loop
 * @param {function} callback The callback function to call each time
 */
const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

const syncPremiumRoles = (client) => {
    client.shard.broadcastEval(() => {
        if (this.guilds.cache.has(client.config.supportServer)){
            this.database.fetchPremiumUserIDs().then((userIDs) => {
                const guild = this.guilds.cache.get(this.config.supportServer);
                userIDs
                    .filter((r) => guild.members.cache.has(r) && !guild.members.cache.get(r).roles.cache.has(this.config.premiumRole))
                    .forEach((m) => guild.members.cache.get(m).roles.add(this.config.premiumRole));
            });
        }
    });
};

/**
 * @param {string} message The message to format
 * @param {object} member The member who joined/has left
 * @param {string} locale The moment locale to use
 * @param {object} invData Data related to the invite and inviter
 * @returns {string|MessageEmbed} The formatted string or embed
 */
const formatMessage = (message, member, numberOfJoins, locale, invData) => {

    moment.locale(locale);

    variables.forEach((variable) => {
        if (variable.requireInviter && !invData) return;
        const matches = [variable.name, variable.aliases].flat();
        matches.forEach((match) => {
            message = message.replaceAll(`{${match}}`, variable.display(member, numberOfJoins, invData, moment));
        });
    });

    let data;
    let embed;
    try {
        const embedData = JSON.parse(message.substr(0, 10000));
        embed = true;
        data = embedData;
    } catch (e) {
        embed = false;
        data = message.substr(0, 2000);
    }
    
    return embed ? { embed: data } : data;
    
};

/**
 * Generate a random ID (used for states)
 * @returns {string} The generated ID
 */
const randomID = () => {
    return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
};

/**
 * Gets the next rank for a member
 * @param {number} inviteCount The member's invite count
 * @param {array} ranks The ranks of the guild
 * @param {Guild} guild The guild
 * @returns {?object} The next rank, if found
 */
const getNextRank = (inviteCount, ranks, guild) => {
    let nextRank = null;
    ranks.forEach((rank) => {
        // If the rank is lower
        if (parseInt(rank.inviteCount) <= inviteCount) return;
        // If the rank is higher than rank
        if (nextRank && (parseInt(nextRank.inviteCount) < parseInt(rank.inviteCount))) return;
        // If the role was deleted
        if (!guild.roles.cache.get(rank.roleID)) return;
        // Mark the rank as nextRank
        nextRank = rank;
    });
    return nextRank;
};

/**
 * Assigns ranks rewards to a member
 * @param {object} member The member on who the ranks will be assigned
 * @param {number} inviteCount The member's invite count
 * @param {array} ranks The ranks of the guild
 * @param {boolean} keepRanks Whether the members should keep their ranks, even if they doesn't have enough invites
 * @param {boolean} stackedRanks Whether the ranks should be stacked (otherwise, only the highest rank will be kept)
 * @returns {Promise<void>}
 */
const assignRanks = async (member, inviteCount, ranks, keepRanks, stackedRanks) => {
    if (member.user.bot) return;
    const assigned = new Array();
    await asyncForEach((ranks.sort((a, b) => b.inviteCount - a.inviteCount)), async (rank) => {
        // If the guild doesn't contain the rank anymore
        if (!member.guild.roles.cache.has(rank.roleID)) return;
        // If the bot doesn't have permissions to assign role to this member
        if (!member.guild.roles.cache.get(rank.roleID).editable) return;
        // If the member can't obtain the rank
        if (inviteCount < parseInt(rank.inviteCount)){
            if (!keepRanks){
                // If the member doesn't have the rank
                if (!member.roles.cache.has(rank.roleID)) return;
                // Remove the ranks
                await member.roles.remove(rank.roleID);
            }
        } else {
            assigned.push(rank.roleID);
            // If the member already has the rank
            if (member.roles.cache.has(rank.roleID)) return;
            // Add the role to the member
            if (!stackedRanks) await member.roles.add(rank.roleID);
        }
    });
    if (stackedRanks && assigned.length > 0) {
        await member.roles.add(assigned.shift());
        for (const role of assigned){
            if (member.roles.cache.has(role)) await member.roles.remove(role);
        }
    }
    return;
};

/**
 * Post client stats to Top.gg
 * @param {object} client The Discord client
 */
const postTopStats = async (client) => {
    const shard_id = client.shard.ids[0];
    const shard_count = client.shard.count;
    const server_count = client.guilds.cache.size;
    const headers = { "content-type": "application/json", authorization: client.config.topToken };
    const options = {
        method: "POST",
        body: JSON.stringify({ shard_id, shard_count, server_count }),
        headers
    };
    fetch("https://discordbots.org/api/bots/stats", options).then(async (res) => {
        const json = await res.json();
        if (!res.error) client.log("Top.gg stats successfully posted.", "log");
        else client.log("Top.gg stats cannot be posted. Error: "+json.error, "error");
    });
};

const isSameDay = (firstDate, secondDate) => {
    return `${firstDate.getDate()}|${firstDate.getMonth()}|${firstDate.getFullYear()}` ===
    `${secondDate.getDate()}|${secondDate.getMonth()}|${secondDate.getFullYear()}`;
};

/**
 * Get the name of the last X days
 * @param {number} numberOfDays The number of days to get
 * @param {array} monthIndex The names of the month
 * @returns {array} The formatted names
 */
const lastXDays = (numberOfDays, monthIndex) => {
    const days = [];
    for (let i = 0; i < numberOfDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        let day = date.getDate();
        const month = monthIndex[date.getMonth()];
        if (day < 10) day = `0${day}`;
        days.push(`${day} ${month}`);
    }
    return days.reverse();
};

/**
 * Get the number of members who joined in a specific time
 * @param {number} numberOfDays The number of days to get
 * @param {array} members The total of the members
 * @returns {array} An array with the total of members whose joined for each day
 */
const joinedXDays = (numberOfDays, members) => {
    // Final result
    const days = [];
    // Pointer
    let lastDate = 0;
    // Sort the members by their joined date
    members = members.sort((a,b) => b.joinedTimestamp - a.joinedTimestamp);
    for (let i = 0; i < numberOfDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        // For each member in the server
        members.forEach((member) => {
            // Get the joinedDate
            const joinedDate = new Date(member.joinedTimestamp);
            // If the joinedDate is the same as the date which we are testing
            if (isSameDay(joinedDate, date)){
                // If the last item in the array is not the same day counter
                if (lastDate !== joinedDate.getDate()){
                    lastDate = joinedDate.getDate();
                    days.push(1);
                } else {
                    let currentDay = days.pop();
                    days.push(++currentDay);
                }
            }
        });
        // If nobody joins this day, set to 0
        if (days.length < i) days.push(0);
    }
    return days.reverse();
};

/**
 * Compare two arrays
 * @param {Array} value The first array
 * @param {Array} other The second array
 * @returns {Boolean} Whether the arrays are equals
 */
const isEqual = (value, other) => {
    const type = Object.prototype.toString.call(value);
    if (type !== Object.prototype.toString.call(other)) return false;
    if (["[object Array]", "[object Object]"].indexOf(type) < 0) return false;
    const valueLen = type === "[object Array]" ? value.length : Object.keys(value).length;
    const otherLen = type === "[object Array]" ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false;
    const compare = (item1, item2) => {
        const itemType = Object.prototype.toString.call(item1);
        if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
            if (!isEqual(item1, item2)) return false;
        }
        else {
            if (itemType !== Object.prototype.toString.call(item2)) return false;
            if (itemType === "[object Function]") {
                if (item1.toString() !== item2.toString()) return false;
            } else {
                if (item1 !== item2) return false;
            }
        }
    };
    if (type === "[object Array]") {
        for (var i = 0; i < valueLen; i++) {
            if (compare(value[i], other[i]) === false) return false;
        }
    } else {
        for (var key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                if (compare(value[key], other[key]) === false) return false;
            }
        }
    }
    return true;
};

/**
 * Format a date for a specified locale
 * @param {Date} dateToFormat 
 * @param {string} format 
 * @param {string} locale 
 */
const formatDate = (dateToFormat, format, locale) => {
    moment.locale(locale.substr(0, 2));
    return moment(dateToFormat).format(format);
};

/**
 * Sends a message to the status webhhook
 * @param {string} content The content to send
 */
const sendStatusWebhook = (content) => {
    const webhook = new Discord.WebhookClient(config.statusWebhook.id, config.statusWebhook.token);
    return webhook.send(content);
};

module.exports = {
    stringOrNull,
    pgEscape,
    asyncForEach,
    formatMessage,
    formatDate,
    randomID,
    getNextRank,
    assignRanks,
    postTopStats,
    lastXDays,
    joinedXDays,
    isEqual,
    syncPremiumRoles,
    sendStatusWebhook
};