const config = require("../config");
const Discord = require("discord.js");

module.exports = class {

    constructor (client) {
        this.client = client;
    }

    async run (message) {

        const data = { color: this.client.config.color, footer: this.client.config.footer };

        if(!message.guild || message.author.bot) return;
        if(message.content === `<@${this.client.user.id}>`) return message.reply("Hello ! Please type **+help** to see all commands !");

        let guildData = await this.client.findOrCreateGuild({ id: message.guild.id });
        data.guild = guildData;

        let memberData = await this.client.findOrCreateGuildMember({ id: message.author.id, guildID: message.guild.id, bot: message.author.bot });
        data.member = memberData;

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
            return message.channel.send(`__**${this.client.config.emojis.error} Missing permissions**__\n\nI need the following permissions for this command to work properly: ${neededPermissions.map((p) => permissions[p]).join(", ")}`);
        }

        /* Command disabled */
        if(!cmd.conf.enabled){
            return message.channel.send(this.client.config.emojis.error+" | This command is currently disabled!");
        }

        /* User permissions */
        const permLevel = await this.client.getLevel(message);
        if(permLevel < cmd.conf.permLevel){
            return message.channel.send(this.client.config.emojis.error+" | This command requires the permission level: `"+this.client.permLevels[cmd.conf.permLevel].name+"` !");
        }

        this.client.logger.log(`${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`, "cmd");

        // If the command exists, **AND** the user has permission, run it.
        cmd.run(message, args, data);

    }

};
