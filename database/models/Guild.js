module.exports = class GuildModel {

    constructor (database, guildID) {

        this.database = database;

        this.id = guildID;
        this.settings = null;
        this.ranks = null;
        this.blacklistedUsers = null;
        this.messages = null;

        this.inserted = insert;
    }

    // Fetch guild data

    fetchSettings () {
        return this.database.fetchGuildSettings().then((settings) => this.settings = settings);
    }

    fetchRanks () {
        return this.database.fetchGuildRanks().then((ranks) => this.ranks = ranks);
    }

    fetchBlacklistedUsers () {
        return this.database.fetchGuildBlacklistedUsers().then((users) => this.blacklistedUsers = users);
    }

    fetchMessages () {
        return this.database.fetchGuildMessages().then((messages) => this.messages = messages);
    }

};
