const Discord = require("discord.js"),
moment = require("moment");

module.exports = {

    /**
     * @param {array} array The array to loop
     * @param {function} callback The callback function to call each time
     */
    async asyncForEach (array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },

    /**
     * @param {string} message The message to format
     * @param {object} member The member who joined/has left
     * @param {object} inviter The user who invite the member
     * @param {object} invite The used invite informations
     * @param {string} locale The moment locale to use
     * @param {object} inviterData The mongoose document of the inviter
     * @returns {string} The formatted string
     */
    formatMessage(message, member, inviter, invite, locale, inviterData){
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
    },

    /**
     * Generate a random ID (used for states)
     * @returns {string} The generated ID
     */
    randomID(){
        return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
    }

}