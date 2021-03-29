const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "set-fake-threshold",
            enabled: true,
            aliases: [ "setfake-threshold", "setfake", "set-fake" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args) {
        const fakeThreshold = args[0];
        if (!fakeThreshold || (isNaN(fakeThreshold) && fakeThreshold !== "disable")) {
            return message.error("config/set-fake-threshold:MISSING_DAYS");
        }
        if (fakeThreshold === "disable") {
            await this.client.database.updateGuildSetting(message.guild.id, "fakeThreshold", null);
            message.success("config/set-fake-threshold:DISABLED");
        } else {
            const dayCount = parseInt(fakeThreshold);
            await this.client.database.updateGuildSetting(message.guild.id, "fakeThreshold", dayCount);
            message.success("config/set-fake-threshold:UPDATED", {
                dayCount
            });
        }
    }
};
