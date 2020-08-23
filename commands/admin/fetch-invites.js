const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "fetch-invites",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS", "MANAGE_GUILD" ],
            permLevel: 2
        });
    }

    async run (message) {
        const invites = await message.guild.fetchInvites();
        this.client.invitations[message.guild.id] = invites;
        message.success("admin/fetch-invites:SUCCESS");
    }

};
