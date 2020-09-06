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

        const bonus = args[0];
        if (!bonus) return message.error("admin/addbonus:MISSING_AMOUNT", {
            prefix: data.guild.prefix
        });
        if (isNaN(bonus) || (parseInt(bonus) < 1) || !Number.isInteger(parseInt(bonus))) return message.error("admin/addbonus:INVALID_AMOUNT", {
            prefix: data.guild.prefix
        });

        const member = message.mentions.members.first() || await this.client.resolveMember(args.slice(1).join(" "), message.guild);
        if (!member && args[1] !== "all") return message.error("admin/addbonus:MISSING_TARGET", {
            prefix: data.guild.prefix
        });
        if (member){
            if (data.guild.blacklistedUsers.includes(member.id)){
                return message.error("admin/blacklist:BLACKLISTED", {
                    username: member.user.username
                });
            }
            const memberData = await this.client.database.fetchMember(member.id, message.guild.id);
            memberData.bonus += parseInt(bonus);
            await memberData.updateInvites();

            const embed = new Discord.MessageEmbed()
                .setAuthor(message.translate("admin/addbonus:SUCCESS_TITLE"))
                .setDescription(message.translate("admin/addbonus:SUCCESS_CONTENT_MEMBER", {
                    prefix: data.guild.prefix,
                    usertag: member.user.tag,
                    username: member.user.username
                }))
                .setColor(data.color)
                .setFooter(data.footer);

            message.channel.send({ embed });
        } else {
            const conf = await message.sendT("admin/addbonus:CONFIRMATION_ALL", {
                count: bonus
            });
            await message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
                if (collected.first().content === "cancel") return conf.error("common:CANCELLED", null, true);
                collected.first().delete();

                await conf.sendT("misc:PLEASE_WAIT", null, true, false, "loading");
                await message.guild.fetch();
                const members = message.guild.members.cache.map((m) => {
                    return {
                        userID: m.id,
                        guildID: message.guild.id
                    };
                });
                await this.client.database.fetchMembers(members);
                await this.client.database.addBonusInvitesMembers(message.guild.id, bonus);
                const embed = new Discord.MessageEmbed()
                    .setAuthor(message.translate("admin/addbonus:SUCCESS_TITLE"))
                    .setDescription(message.translate("admin/addbonus:SUCCESS_CONTENT_ALL", {
                        prefix: data.guild.prefix
                    }))
                    .setColor(data.color)
                    .setFooter(data.footer);

                conf.edit(null, { embed });
            }).catch((err) => {
                console.error(err);
                return conf.error("common:CANCELLED", null, true);
            });
        }
    }

};
