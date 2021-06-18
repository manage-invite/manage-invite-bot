const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "addbonus",
            enabled: true,
            aliases: [ "addinvites", "addinvite" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        const blacklistedUsers = await this.client.database.fetchGuildBlacklistedUsers(message.guild.id);

        const bonus = args[0];
        if (!bonus) return message.error("admin/addbonus:MISSING_AMOUNT", {
            prefix: message.guild.settings.prefix
        });
        if (isNaN(bonus) || (parseInt(bonus) < 1) || !Number.isInteger(parseInt(bonus))) return message.error("admin/addbonus:INVALID_AMOUNT", {
            prefix: message.guild.settings.prefix
        });

        const user = message.mentions.users.first() || await this.client.resolveUser(args.slice(1).join(" "));
        if (!user && args[1] !== "all") return message.error("admin/addbonus:MISSING_TARGET", {
            prefix: message.guild.settings.prefix
        });
        if (user){
            if (blacklistedUsers.includes(user.id)){
                return message.error("admin/blacklist:BLACKLISTED", {
                    username: user.username
                });
            }
            const memberData = await this.client.database.fetchGuildMember({
                userID: user.id,
                guildID: message.guild.id,
                storageID: message.guild.settings.storageID
            });
            if (memberData.notCreated) await this.client.database.createGuildMember({
                userID: user.id,
                guildID: message.guild.id,
                storageID: message.guild.settings.storageID
            });
            await this.client.database.addInvites({
                userID: user.id,
                guildID: message.guild.id,
                storageID: message.guild.settings.storageID,
                number: parseInt(bonus),
                type: "bonus"
            });

            const embed = new Discord.MessageEmbed()
                .setAuthor(message.translate("admin/addbonus:SUCCESS_TITLE"))
                .setDescription(message.translate("admin/addbonus:SUCCESS_CONTENT_MEMBER", {
                    prefix: message.guild.settings.prefix,
                    usertag: user.tag,
                    username: user.username
                }))
                .setColor(data.color)
                .setFooter(data.footer);

            message.channel.send({ embeds: [embed] });
        } else {
            const conf = await message.sendT("admin/addbonus:CONFIRMATION_ALL", {
                count: bonus
            });
            await message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
                if (collected.first().content === "cancel") return conf.error("common:CANCELLED", null, true);
                collected.first().delete().catch(() => {});

                await conf.sendT("misc:PLEASE_WAIT", null, true, false, "loading");
                await message.guild.members.fetch();
                await this.client.database.addGuildInvites({
                    userIDs: message.guild.members.cache.map((m) => m.id),
                    guildID: message.guild.id,
                    storageID: message.guild.settings.storageID,
                    number: parseInt(bonus),
                    type: "bonus"
                });
                const embed = new Discord.MessageEmbed()
                    .setAuthor(message.translate("admin/addbonus:SUCCESS_TITLE"))
                    .setDescription(message.translate("admin/addbonus:SUCCESS_CONTENT_ALL", {
                        prefix: message.guild.settings.prefix
                    }))
                    .setColor(data.color)
                    .setFooter(data.footer);

                conf.edit({ embeds: [embed] });
            }).catch((err) => {
                console.error(err);
                return conf.error("common:CANCELLED", null, true);
            });
        }
    }

};
