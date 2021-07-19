const Constants = require("../helpers/constants");

module.exports = class {

    constructor (client) {
        this.client = client;
    }

    async run (interaction) {
        
        if (interaction.isCommand()) {

            const startAt = Date.now();
        
            if (!interaction.guildId) return;

            const [
                guildSettings,
                guildSubscriptions
            ] = await Promise.all([
                this.client.database.fetchGuildSettings(interaction.guildId),
                this.client.database.fetchGuildSubscriptions(interaction.guildId)
            ]);
            const isPremium = guildSubscriptions.some((sub) => new Date(sub.expiresAt).getTime() > (Date.now()-3*24*60*60*1000));
            const aboutToExpire = isPremium && !(guildSubscriptions.some((sub) => new Date(sub.expiresAt).getTime() > (Date.now() + 5 * 24 * 60 * 60000)));

            interaction.guild.settings = guildSettings;

            const data = {
                settings: guildSettings,
                color: Constants.Embed.COLOR,
                footer: aboutToExpire ? "Attention, your ManageInvite subscription is about to expire!" : Constants.Embed.FOOTER
            };

            // Gets the command
            const cmd = this.client.commands.get(interaction.command.name);

            const guild = this.client.guilds.cache.get(interaction.guildId);

            const member = interaction.member || await guild.members.fetch(interaction.user.id);

            const permLevel = await this.client.getLevel(member);

            if (!isPremium && permLevel < 4){
                return interaction.reply({ content: interaction.guild.translate("misc:NEED_UPGRADE", {
                    username: interaction.user.username,
                    discord: Constants.Links.DISCORD,
                    emote: Constants.Emojis.UPGRADE
                }) });
            }

            if (data.settings.cmdChannel && (interaction.channelId !== data.settings.cmdChannel) && permLevel < 1){
                return interaction.reply({ content: interaction.guild.translate("misc:WRONG_CHANNEL", {
                    channel: `<#${data.settings.cmdChannel}>`
                }), ephemeral: true });
            }

            if (!cmd.conf.enabled){
                return interaction.reply({ content: interaction.guild.translate("misc:COMMAND_DISABLED") });
            }

            /* Client permissions */
            const neededPermissions = [];
            cmd.conf.clientPermissions.forEach((permission) => {
                if (!interaction.channel.permissionsFor(interaction.guild.me).has(permission)) {
                    neededPermissions.push(permission);
                }
            });
            if (neededPermissions.length > 0) {
                return interaction.reply({ content: interaction.guild.translate("misc:BOT_MISSING_PERMISSIONS", {
                    permissions: neededPermissions.map((p) => "`"+p+"`").join(", ")
                }) });
            }

            /* User permissions */
            if (permLevel < cmd.conf.permLevel){
                return interaction.reply({ content: interaction.guild.translate("misc:USER_MISSING_PERMISSIONS", {
                    level: this.client.permLevels[cmd.conf.permLevel].name
                }) });
            }
        
            const userKey = `${interaction.user.id}${interaction.guild.id}`;
            const cooldownTime = this.client.cooldownedUsers.get(userKey);
            const currentDate = parseInt(Date.now()/1000);
            if (cooldownTime) {
                const isExpired = cooldownTime <= currentDate;
                const remainingSeconds = cooldownTime - currentDate;
                if (!isExpired) {
                    return interaction.reply({ content: interaction.guild.translate("misc:COOLDOWNED", {
                        remainingSeconds,
                        emote: "<:atlanta_time:598169056125911040>"
                    }) });
                }
            }

            //TODO: implement cooldown
            //const cooldown = cmd.conf.cooldown(message, args);
            //cooldownedUsers.set(userKey, cooldown + currentDate);

            this.client.log(`${interaction.user.username} (${interaction.user.id}) ran slash command ${cmd.help.name} (${Date.now()-startAt}ms)`, "cmd");

            this.client.commandsRan++;
            // If the command exists, **AND** the user has permission, run it.
            cmd.runInteraction(interaction, data);
        }

    }

};
