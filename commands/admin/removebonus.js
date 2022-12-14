const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "removebonus",
            enabled: true,
            aliases: [ "removeinvites", "removeinvite" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Remove bonus invites from a user",
                
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: true,
                        description: "The user to remove bonus invites from"
                    },
                    {
                        name: "invites",
                        type: ApplicationCommandOptionTypes.INTEGER,
                        required: true,
                        description: "The number of invites to remove"
                    }
                ]
            }
        });
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
            number: -parseInt(bonus),
            type: "bonus"
        });

        const embed = new Discord.MessageEmbed()
            .setAuthor(interaction.guild.translate("admin/removebonus:SUCCESS_TITLE"))
            .setDescription(interaction.guild.translate("admin/removebonus:SUCCESS_CONTENT_MEMBER", {
                prefix: interaction.guild.settings.prefix,
                usertag: user.tag,
                username: user.username
            }))
            .setColor(data.color)
            .setFooter(data.footer);

        interaction.reply({ embeds: [embed] });
    }

};
