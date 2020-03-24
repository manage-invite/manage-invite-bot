module.exports = class LeavePlugin {
    constructor(guild, data) {
        if(!data) data = {};
        this.guild = guild;
        this.handler = guild.handler;
        this.inserted = Object.keys(data).length !== 0;
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

    // Insert the plugin in the db if it doesn't exist
    async insert() {
        if (!this.inserted) {
            await this.handler.query(`
                INSERT INTO guild_plugins
                (guild_id, plugin_name, plugin_data) VALUES
                ('${this.guild.id}', 'leave', '${this.data}');
            `);
            this.handler.removeGuildFromOtherCaches(this.guild.id);
            this.inserted = true;
        }
        return this;
    }
}
