const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "setjoindm",
            enabled: true,
            aliases: [ "setdm", "setdmjoin" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        
        if(!data.guild.joinDM.enabled){
            data.guild.joinDM.enabled = true;
            await data.guild.joinDM.updateData();
            return message.success("config/setjoindm:ENABLED");
        }
        if(data.guild.joinDM.enabled){
            data.guild.joinDM.enabled = false;
            await data.guild.joinDM.updateData();
            return message.success("config/setjoindm:DISABLED");
        }
    }
};
