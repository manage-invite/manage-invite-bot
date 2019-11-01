module.exports = class Command {
    constructor(client, {
        name = null,
        enabled = true,
        aliases = new Array(),
        clientPermissions = new Array(),
        permLevel = "Owner"
    })
    {
        this.client = client;
        this.conf = { enabled, aliases, permLevel, clientPermissions };
        this.help = { name };
    }
};