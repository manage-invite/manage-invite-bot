const config = require("../config");
const Discord = require("discord.js");

module.exports = class {

    constructor (client) {
        this.client = client;
    }

    async run (message) {

        const startAt = Date.now();

        const data = { color: this.client.config.color, footer: this.client.config.footer };

        if(!message.guild || message.author.bot) return;

        const guildData = await this.client.database.fetchGuild(message.guild.id);
        data.guild = guildData;
        message.language = require("../languages/"+data.guild.language);
    
        if(message.content.match(new RegExp(`^<@!?${this.client.user.id}>( |)$`))) return message.reply(message.language.utils.prefix(data.guild.prefix));

        // If the message does not start with the prefix, cancel
        if(!message.content.toLowerCase().startsWith(guildData.prefix)){
            return;
        }

        // If the message content is "/pay @Androz 10", the args will be : [ "pay", "@Androz", "10" ]
        const args = message.content.slice(guildData.prefix.length).trim().split(/ +/g);
        // The command will be : "pay" and the args : [ "@Androz", "10" ]
        const command = args.shift().toLowerCase();

        // Gets the command
        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

        // If no command found, return;
        if(!cmd) return;
        else message.cmd = cmd;

        /* Client permissions */
        const neededPermissions = [];
        cmd.conf.clientPermissions.forEach((permission) => {
            if(!message.channel.permissionsFor(message.guild.me).has(permission)) {
                neededPermissions.push(permission);
            }
        });
        if(neededPermissions.length > 0) {
            return message.channel.send(message.language.errors.missingPerms(neededPermissions));
        }

        /* Command disabled */
        if(!cmd.conf.enabled){
            return message.channel.send(message.language.errors.disabled());
        }

        /* User permissions */
        const permLevel = await this.client.getLevel(message);
        if(permLevel < cmd.conf.permLevel){
            return message.channel.send(message.language.errors.permLevel(this.client.permLevels[cmd.conf.permLevel].name));
        }

        this.client.logger.log(`${message.author.username} (${message.author.id}) ran command ${cmd.help.name} (${Date.now()-startAt}ms)`, "cmd");

        this.client.commandsRan++;
        // If the command exists, **AND** the user has permission, run it.
        cmd.run(message, args, data);

    }

};
