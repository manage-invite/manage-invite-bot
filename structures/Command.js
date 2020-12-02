module.exports = class Command {
    constructor (client, {
        name = null,
        enabled = true,
        aliases = new Array(),
        clientPermissions = new Array(),
        permLevel = "Owner",
        cooldown = () => 0
    })
    {
        this.client = client;
        this.conf = { enabled, aliases, permLevel, clientPermissions, cooldown };
        this.help = { name };
    }
};