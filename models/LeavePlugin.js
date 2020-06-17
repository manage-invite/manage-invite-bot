module.exports = class LeavePlugin {
    constructor(guild, data) {

        this.guild = guild;
        this.handler = guild.handler;

        // Whether the plugin is enabled
        this.enabled = data.enabled || false;
        // The leave channel
        this.channel = data.channel || null;
        // The leave message
        this.message = data.message || null;

    }

    // Returns a string with the plugin's data
    get data() {
        return JSON.stringify({
            enabled: this.enabled,
            channel: this.channel,
            message: this.message
        }).replace(/'/g, "''");
    }

    // Update the plugin data
    async updateData() {
        await this.handler.query(`
            UPDATE guild_plugins
            SET plugin_data = '${this.data}'
            WHERE
            guild_id = '${this.guild.id}' AND
            plugin_name = 'leave';
        `);
        this.handler.removeGuildFromOtherCaches(this.guild.id);
        return this;
    }
}
