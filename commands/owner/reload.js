const Command = require("../../structures/Command.js");

module.exports = class extends Command {

    constructor (client) {
        super(client, {
            name: "reload",
            enabled: true,
            aliases: [ "r" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 5
        });
    }

    async run (message, args) {
        const command = args[0];
        if (command === "l"){
            const path = require("path");
            const file = path.join(__dirname, "..", "..", "helpers", "i18n.js");
            this.client.shard.broadcastEval(`
                const i18n = require('${file}');
                i18n().then((r) => {
                    this.translations = r;
                });
            `);
            return message.channel.send(this.client.config.emojis.success+" | Languages reloaded!");
        }
        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
        if (!cmd){
            message.channel.send(this.client.config.emojis.error+" | Cannot find command `"+command+"`!");
        }
        await this.client.shard.broadcastEval(`
            delete require.cache['${cmd.conf.location}'];
            this.unloadCommand('${cmd.conf.location}', '${cmd.help.name}').then(() => {
                this.loadCommand('${cmd.conf.location}', '${cmd.help.name}');
            });
        `);
        message.channel.send(this.client.config.emojis.success+" | `"+command+"` reloaded!");
    }

};
