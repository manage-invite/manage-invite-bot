const config = require("../config");
const Discord = require("discord.js");
const Constants = require("../Constants");

module.exports = class {

    constructor (client) {
        this.client = client;
    }

    async run (message) {

        if(message.partial || message.channel.partial) return;

        const startAt = Date.now();
        
        if(!message.guild || message.author.bot) return;

        const guildData = message.guild.data = await this.client.database.fetchGuild(message.guild.id);
    
        const data = {
            guild: guildData,
            color: this.client.config.color,
            footer: guildData.aboutToExpire ? `Attention, your ManageInvite subscription is about to expire!` : this.client.config.footer
        };

        if(message.content.match(new RegExp(`^<@!?${this.client.user.id}>( |)$`))) return message.reply(message.translate("misc:PREFIX", {
            prefix: guildData.prefix
        }));

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
            return message.error("misc:BOT_MISSING_PERMISSIONS", {
                permissions: neededPermissions.map((p) => "`"+p+"`").join(", ")
            });
        }

        /* Command disabled */
        if(!cmd.conf.enabled){
            return message.error("misc:COMMAND_DISABLED");
        }

        /* User permissions */
        const permLevel = await this.client.getLevel(message);
        if(permLevel < cmd.conf.permLevel){
            return message.error("misc:USER_MISSING_PERMISSIONS", {
                level: this.client.permLevels[cmd.conf.permLevel].name
            });
        }

        if(!data.guild.premium && permLevel < 4){
            return message.sendT("misc:NEED_UPGRADE", {
                username: message.author.username,
                discord: Constants.Links.DISCORD,
                emote: this.client.config.emojis.upgrade
            });
        }

        if(data.guild.cmdChannel && (message.channel.id !== data.guild.cmdChannel)){
            message.delete();
            return message.author.send(message.translate("misc:WRONG_CHANNEL", {
                channel: `<#${data.guild.cmdChannel}>`
            }));
        }

        this.client.logger.log(`${message.author.username} (${message.author.id}) ran command ${cmd.help.name} (${Date.now()-startAt}ms)`, "cmd");

        this.client.commandsRan++;
        // If the command exists, **AND** the user has permission, run it.
        cmd.run(message, args, data);

    }

};
