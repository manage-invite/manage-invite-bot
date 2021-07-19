module.exports = class Command {
    constructor (client, {
        name = null,
        enabled = true,
        aliases = new Array(),
        clientPermissions = new Array(),
        permLevel = "Owner",
        cooldown = () => 0,
        slashCommandOptions = null
    })
    {
        this.client = client;
        this.conf = { enabled, aliases, permLevel, clientPermissions, cooldown };
        this.help = { name };
        this.slashCommandOptions = slashCommandOptions && {
            name,
            options: slashCommandOptions.options || [],
            description: slashCommandOptions.description
        };
    }

};