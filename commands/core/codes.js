const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "my-codes",
            enabled: true,
            aliases: [ "code" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Get your invite codes"
            }
        });
    }

    async run (message, args, data) {
        const blacklistedUsers = await this.client.database.fetchGuildBlacklistedUsers(message.guild.id);
        if (blacklistedUsers.includes(message.author.id)) return message.error("admin/blacklist:AUTHOR_BLACKLISTED");

        const user = message.author;

        const invites = await message.guild.invites.fetch();

        const userInvites = invites.filter((i) => i.inviter?.id === user.id);

        const embed = new Discord.MessageEmbed()
            .setAuthor(user.tag, user.displayAvatarURL())
            .setDescription(userInvites.size > 0 ? userInvites.map((invite) => `<#${invite.channelId}> | ${invite.uses} uses`) : `${message.translate("core/codes:NO_CODE")}`)
            .setColor(data.color)
            .setFooter(userInvites.size > 0 ? `Total: ${userInvites.map((invite) => invite.uses).reduce((p, c) => p + c)} uses` : data.footer);

        message.channel.send({ embeds: [embed] });
    }

    async runInteraction (interaction, data) {
        const blacklistedUsers = await this.client.database.fetchGuildBlacklistedUsers(interaction.guild.id);
        if (blacklistedUsers.includes(interaction.user.id)) {
            return interaction.reply({ content: interaction.guild.translate("admin/blacklist:AUTHOR_BLACKLISTED"), ephemeral: true });
        }

        const invites = await interaction.guild.invites.fetch();

        const user = interaction.user;

        const userInvites = invites.filter((i) => i.inviter?.id === user.id);

        const embed = new Discord.MessageEmbed()
            .setAuthor(user.tag, user.displayAvatarURL())
            .setDescription(userInvites.size > 0 ? userInvites.map((invite) => `<#${invite.channelId}> | ${invite.uses} uses`) : `${interaction.guild.translate("core/codes:NO_CODE")}`)
            .setColor(data.color)
            .setFooter(userInvites.size > 0 ? `Total: ${userInvites.map((invite) => invite.uses).reduce((p, c) => p + c)} uses` : data.footer);

        interaction.reply({ embeds: [embed] });
    }

};
