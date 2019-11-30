const Discord = require("discord.js"),
moment = require("moment");

/**
 * @param {array} array The array to loop
 * @param {function} callback The callback function to call each time
 */
const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

/**
 * @param {string} message The message to format
 * @param {object} member The member who joined/has left
 * @param {object} inviter The user who invite the member
 * @param {object} invite The used invite informations
 * @param {string} locale The moment locale to use
 * @param {object} inviterData The mongoose document of the inviter
 * @returns {string} The formatted string
 */
const formatMessage = (message, member, inviter, invite, locale, inviterData) => {
    moment.locale(locale);
    return message
    .replace(/{user}/g, member.toString())
    .replace(/{user.name}/g, member.user.username)
    .replace(/{user.tag}/g, member.user.tag)
    .replace(/{user.createdat}/g, moment(member.user.createdAt, "YYYYMMDD").fromNow())
    .replace(/{guild}/g, member.guild.name)
    .replace(/{guild.count}/g, member.guild.memberCount)
    .replace(/{inviter}/g, inviter.toString())
    .replace(/{inviter.tag}/g, inviter.tag)
    .replace(/{inviter.name}/g, inviter.username)
    .replace(/{inviter.invites}/g, inviterData.invites + inviterData.bonus - inviterData.fake - inviterData.leaves)
    .replace(/{invite.code}/g, invite.code)
    .replace(/{invite.uses}/g, invite.uses)
    .replace(/{invite.url}/g, invite.url);
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
 * @returns {?object} The next rank, if found
 */
const getNextRank = (inviteCount, ranks) => {
    let nextRank = null;
    ranks.forEach((rank) => {
        // If the rank is lower
        if(parseInt(rank.inviteCount) <= inviteCount) return;
        // If the rank is higher than rank
        if(nextRank && (parseInt(nextRank.inviteCount) < parseInt(rank.inviteCount))) return;
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
 * @returns {object} The assigned and removed ranks
 */
const assignRanks = async (member, inviteCount, ranks) => {
    let assigned = new Array();
    let removed = new Array();
    asyncForEach(ranks, async (rank) => {
        // If the guild doesn't contain the rank anymore
        if(!member.guild.roles.has(rank.roleID)) return;
        // If the bot doesn't have permissions to assign role to this member
        if(!member.guild.roles.get(rank.roleID).editable) return;
        // If the member can't obtain the rank
        if(inviteCount < parseInt(rank.inviteCount)){
            // If the member doesn't have the rank
            if(!member.roles.has(rank.roleID)) return;
            // Remove the ranks
            await member.roles.remove(rank.roleID);
            removed.push(member.guild.roles.get(rank.roleID));
        } else {
            // If the member already has the rank
            if(member.roles.has(rank.roleID)) return;
            // Assign the role to the member
            await member.roles.add(rank.roleID);
            assigned.push(member.guild.roles.get(rank.roleID));
        }
    });
    return { removed, assigned };
};

module.exports = { asyncForEach, formatMessage, randomID, getNextRank, assignRanks };