const Discord = require("discord.js");
const Constants = require("../helpers/constants");
const Guild = require("../database/models/Guild");

const cooldownedUsers = new Discord.Collection();

module.exports = class {

    constructor (client) {
        this.client = client;
    }

    async run (message) {

        if (message.partial || message.channel.partial) return;

        const startAt = Date.now();
        
        if (!message.guild || message.author.bot) return;

        const [
            guildSettings,
            guildSubscriptions
        ] = await Promise.all([
            this.client.database.fetchGuildSettings(message.guild.id),
            this.client.database.fetchGuildSubscriptions(message.guild.id)
        ]);
        message.guild.settings = guildSettings;
        const isPremium = guildSubscriptions.some((sub) => sub.expiresAt > Date.now());
        const aboutToExpire = isPremium && !(guildSubscriptions.some((sub) => sub.expiresAt > (Date.now() + 3 * 24 * 60 * 60000)));

        const data = {
            settings: guildSettings,
            color: this.client.config.color,
            footer: aboutToExpire ? "Attention, your ManageInvite subscription is about to expire!" : this.client.config.footer
        };

        if (message.content.match(new RegExp(`^<@!?${this.client.user.id}>( |)$`))) return message.reply(message.translate("misc:PREFIX", {
            prefix: guildSettings.prefix
        }));

        // If the message does not start with the prefix, cancel
        if (!message.content.toLowerCase().startsWith(guildSettings.prefix)){
            return;
        }

        // If the message content is "/pay @Androz 10", the args will be : [ "pay", "@Androz", "10" ]
        const args = message.content.slice(guildSettings.prefix.length).trim().split(/ +/g);
        // The command will be : "pay" and the args : [ "@Androz", "10" ]
        const command = args.shift().toLowerCase();

        // Gets the command
        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

        // If no command found, return;
        if (!cmd) return;
        else message.cmd = cmd;

        const permLevel = await this.client.getLevel(message);

        if (!isPremium && permLevel < 4){
            return message.sendT("misc:NEED_UPGRADE", {
                username: message.author.username,
                discord: Constants.Links.DISCORD,
                emote: this.client.config.emojis.upgrade
            });
        }

        if (data.settings.cmdChannel && (message.channel.id !== data.settings.cmdChannel) && permLevel < 1){
            message.delete().catch(() => {});
            return message.author.send(message.translate("misc:WRONG_CHANNEL", {
                channel: `<#${data.settings.cmdChannel}>`
            })).catch(() => {});
        }

        if (!cmd.conf.enabled){
            return message.error("misc:COMMAND_DISABLED");
        }

        /* Client permissions */
        const neededPermissions = [];
        cmd.conf.clientPermissions.forEach((permission) => {
            if (!message.channel.permissionsFor(message.guild.me).has(permission)) {
                neededPermissions.push(permission);
            }
        });
        if (neededPermissions.length > 0) {
            return message.error("misc:BOT_MISSING_PERMISSIONS", {
                permissions: neededPermissions.map((p) => "`"+p+"`").join(", ")
            });
        }

        /* User permissions */
        if (permLevel < cmd.conf.permLevel){
            return message.error("misc:USER_MISSING_PERMISSIONS", {
                level: this.client.permLevels[cmd.conf.permLevel].name
            });
        }
        
        const userKey = `${message.author.id}${message.guild.id}`;
        const cooldownTime = cooldownedUsers.get(userKey);
        const currentDate = parseInt(Date.now()/1000);
        if (cooldownTime) {
            const isExpired = cooldownTime <= currentDate;
            const remainingSeconds = cooldownTime - currentDate;
            if (!isExpired) {
                return message.sendT("misc:COOLDOWNED", {
                    remainingSeconds,
                    emote: "<:atlanta_time:598169056125911040>"
                });
            }
        }

        const cooldown = cmd.conf.cooldown(message, args);
        cooldownedUsers.set(userKey, cooldown + currentDate);

        this.client.log(`${message.author.username} (${message.author.id}) ran command ${cmd.help.name} (${Date.now()-startAt}ms)`, "cmd");

        this.client.commandsRan++;
        // If the command exists, **AND** the user has permission, run it.
        cmd.run(message, args, data);

    }

};
