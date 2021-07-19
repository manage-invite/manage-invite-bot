const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "invites",
            enabled: true,
            aliases: [ "invite", "rank" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Get user invites",
                
                options: [
                    {
                        type: 6,
                        name: "user",
                        description: "User to get invites of (default is you)"
                    }
                ]
            }
        });
    }

    async run (message, args, data) {

        const blacklistedUsers = await this.client.database.fetchGuildBlacklistedUsers(message.guild.id);
        if (blacklistedUsers.includes(message.author.id)) return message.error("admin/blacklist:AUTHOR_BLACKLISTED");

        const user = await this.client.resolveUser(args.join(" ")) || message.author;
        const memberData = await this.client.database.fetchGuildMember({
            storageID: message.guild.settings.storageID,
            userID: user.id,
            guildID: message.guild.id
        });

        const translation = {
            username: user.username,
            inviteCount: memberData.invites,
            regularCount: memberData.regular,
            bonusCount: memberData.bonus,
            fakeCount: memberData.fake > 0 ? `-${memberData.fake}` : memberData.fake,
            leavesCount: memberData.leaves > 0 ? `-${memberData.leaves}` : memberData.leaves
        };

        const description = user.id === message.member.id ?
            message.translate("core/invite:AUTHOR_CONTENT", translation) :
            message.translate("core/invite:MEMBER_CONTENT", translation);


        const embed = new Discord.MessageEmbed()
            .setAuthor(user.tag, user.displayAvatarURL())
            .setDescription(description)
            .setColor(data.color)
            .setFooter(data.footer);

        message.channel.send({ embeds: [embed] });
    }

    async runInteraction (interaction, data) {
        const blacklistedUsers = await this.client.database.fetchGuildBlacklistedUsers(interaction.guild.id);
        if (blacklistedUsers.includes(interaction.user.id)) {
            return interaction.reply({ content: interaction.guild.translate("admin/blacklist:AUTHOR_BLACKLISTED"), ephemeral: true });
        }

        const user = interaction.options.getUser("user") || interaction.user;
        const memberData = await this.client.database.fetchGuildMember({
            storageID: interaction.guild.settings.storageID,
            userID: user.id,
            guildID: interaction.guild.id
        });

        const translation = {
            username: user.username,
            inviteCount: memberData.invites,
            regularCount: memberData.regular,
            bonusCount: memberData.bonus,
            fakeCount: memberData.fake > 0 ? `-${memberData.fake}` : memberData.fake,
            leavesCount: memberData.leaves > 0 ? `-${memberData.leaves}` : memberData.leaves
        };

        const description = user.id === interaction.user.id ?
            interaction.guild.translate("core/invite:AUTHOR_CONTENT", translation) :
            interaction.guild.translate("core/invite:MEMBER_CONTENT", translation);


        const embed = new Discord.MessageEmbed()
            .setAuthor(user.tag, user.displayAvatarURL())
            .setDescription(description)
            .setColor(data.color)
            .setFooter(data.footer);

        interaction.reply({ embeds: [embed] });
    }

};
