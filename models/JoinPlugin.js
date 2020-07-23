module.exports = class JoinPlugin {
    constructor(guild, data) {

        this.guild = guild;
        this.handler = guild.handler;

        // Whether the plugin is enabled
        this.enabled = data.enabled || false;
        // The join channel
        this.channel = data.channel || null;
        // The main join message
        this.mainMessage = data.mainMessage || null;
        // The oauth2 join message
        this.oauth2Message = data.oauth2Message || null;
        // The vanity url join message
        this.vanityMessage = data.vanityMessage || null;
        // The unknown join message
        this.unknownMessage = data.unknownMessage || null;
    }

    // Returns a string with the plugin's data
    get data() {
        return JSON.stringify({
            enabled: this.enabled,
            channel: this.channel,
            mainMessage: this.mainMessage,
            oauth2Message: this.oauth2Message,
            vanityMessage: this.vanityMessage,
            unknownMessage: this.unknownMessage
        }).replace(/'/g, "''");
    }

    // Update the plugin data
    async updateData() {
        await this.handler.query(`
            UPDATE guild_plugins
            SET plugin_data = '${this.data}'
            WHERE
            guild_id = '${this.guild.id}' AND
            plugin_name = 'join';
        `);
        this.handler.removeGuildFromOtherCaches(this.guild.id);
        return this;
    }

};
