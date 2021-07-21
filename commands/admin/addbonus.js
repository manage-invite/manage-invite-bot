const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "addbonus",
            enabled: true,
            aliases: [ "addinvites", "addinvite" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Add bonus invites to a user",
                
                options: [
                    {
                        name: "user",
                        type: 6,
                        required: true,
                        description: "The user to add bonus invites to"
                    },
                    {
                        name: "invites",
                        type: 4,
                        required: true,
                        description: "The number of invites to add"
                    }
                ]
            }
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

            const confirmRow = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setStyle("SUCCESS")
                        .setLabel(message.translate("common:CONFIRM"))
                        .setCustomId("confirm"),
                    new Discord.MessageButton()
                        .setStyle("SECONDARY")
                        .setLabel(message.translate("common:CANCEL"))
                        .setCustomId("cancel")
                );

            const conf = await message.channel.send({ content: message.translate("admin/addbonus:CONFIRMATION_ALL", {
                count: bonus
            }), components: [confirmRow] });
            const collector = conf.createMessageComponentCollector({
                filter: () => true,
                time: 90000
            });

            collector.on("collect", async (component) => {

                if (component.customId === "confirm") {

                    await conf.edit({ content: Constants.Emojis.LOADING + " " + message.translate("misc:PLEASE_WAIT"), components: [] });
                    await message.guild.members.fetch();
                    await this.client.database.addGuildInvites({
                        usersID: message.guild.members.cache.map((m) => m.id),
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

                    conf.edit({ content: null, embeds: [embed], components: [] });

                } else if (component.customId === "cancel") {
                    conf.edit({ content: Constants.Emojis.SUCCESS + " " + message.translate("common:CANCELLED"), components: [] });
                    collector.stop();
                }

                component.deferUpdate();

            });

            collector.on("end", (_, reason) => {
                if (reason === "time") {
                    conf.edit({ content: Constants.Emojis.ERROR + " " + message.translate("common:CANCELLED"), components: [] });
                }
            });
        }
    }

    async runInteraction (interaction, data) {

        const blacklistedUsers = await this.client.database.fetchGuildBlacklistedUsers(interaction.guild.id);

        const bonus = interaction.options.getInteger("invites");
        const user = interaction.options.getUser("user");
        if (blacklistedUsers.includes(user.id)){
            return interaction.reply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("admin/blacklist:BLACKLISTED", {
                username: user.username
            }) });
        }
        const memberData = await this.client.database.fetchGuildMember({
            userID: user.id,
            guildID: interaction.guild.id,
            storageID: interaction.guild.settings.storageID
        });
        if (memberData.notCreated) await this.client.database.createGuildMember({
            userID: user.id,
            guildID: interaction.guild.id,
            storageID: interaction.guild.settings.storageID
        });
        await this.client.database.addInvites({
            userID: user.id,
            guildID: interaction.guild.id,
            storageID: interaction.guild.settings.storageID,
            number: parseInt(bonus),
            type: "bonus"
        });

        const embed = new Discord.MessageEmbed()
            .setAuthor(interaction.guild.translate("admin/addbonus:SUCCESS_TITLE"))
            .setDescription(interaction.guild.translate("admin/addbonus:SUCCESS_CONTENT_MEMBER", {
                prefix: interaction.guild.settings.prefix,
                usertag: user.tag,
                username: user.username
            }))
            .setColor(data.color)
            .setFooter(data.footer);

        interaction.reply({ embeds: [embed] });
    }

};
