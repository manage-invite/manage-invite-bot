const Command = require("../../structures/Command.js"),
    Constants = require("../../helpers/constants");

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
            return message.channel.send(Constants.Emojis.SUCCESS+" | Languages reloaded!");
        }
        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
        if (!cmd){
            message.channel.send(Constants.Emojis.WARN+" | Cannot find command `"+command+"`... Try loading only.");
        }
        await this.client.shard.broadcastEval(`
            delete require.cache['${cmd.conf.location}'];
            if (${cmd ? "true" : "false"}) {
                this.unloadCommand('${cmd.conf.location}', '${cmd.help.name}').then(() => {
                    this.loadCommand('${cmd.conf.location}', '${cmd.help.name}');
                });
            } else {
                this.loadCommand('${cmd.conf.location}', '${cmd.help.name}');
            }
        `);
        message.channel.send(Constants.Emojis.SUCCESS+" | `"+command+"` reloaded!");
    }

};
