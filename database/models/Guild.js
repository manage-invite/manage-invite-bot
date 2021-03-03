module.exports = class GuildModel {

    constructor (database, guildID) {

        this.database = database;

        this.id = guildID;
        this.settings = null;
        this.ranks = null;
        this.blacklistedUsers = null;
        this.messages = null;
    }

    // Fetch guild data

    fetchSettings () {
        return this.database.fetchGuildSettings(this.id).then((settings) => this.settings = settings);
    }

    fetchRanks () {
        return this.database.fetchGuildRanks(this.id).then((ranks) => this.ranks = ranks);
    }

    fetchBlacklistedUsers () {
        return this.database.fetchGuildBlacklistedUsers(this.id).then((users) => this.blacklistedUsers = users);
    }

    fetchMessages () {
        return this.database.fetchGuildMessages(this.id).then((messages) => this.messages = messages);
    }

};
