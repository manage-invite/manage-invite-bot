const config = require("../config");
const Discord = require("discord.js");

module.exports = class {

    constructor (client) {
        this.client = client;
    }

    async run (invite) {
        // If the client isn't fetched
        if(!this.client.fetched) return;
        if(!this.client.invitations[invite.guild.id]) return;
        // Add the invite to the cache
        this.client.invitations[invite.guild.id].set(invite.code, invite);
    }

};
