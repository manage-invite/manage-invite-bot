const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "blacklist",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Blacklist a user from using the bot and being shown on the leaderboard",
                options: [
                    {
                        name: "add",
                        type: Discord.ApplicationCommandOptionType.Subcommand,
                        description: "Add a user to the blacklist",
                        options: [
                            {
                                name: "user",
                                description: "The user to blacklist",
                                type: Discord.ApplicationCommandOptionType.User,
                                required: true
                            }
                        ]
                    },
                    {
                        name: "remove",
                        type: Discord.ApplicationCommandOptionType.Subcommand,
                        description: "Remove a user from the blacklist",
                        options: [
                            {
                                name: "user",
                                description: "The user to remove from the blacklist",
                                type: Discord.ApplicationCommandOptionType.User,
                                required: true
                            }
                        ]
                    },
                    {
                        name: "list",
                        type: Discord.ApplicationCommandOptionType.Subcommand,
                        description: "List all the blacklisted users"
                    }
                ]
            }
        });
    }

    async runInteraction (interaction, data) {

        const guildBlacklistedUsers = await this.client.database.fetchGuildBlacklistedUsers(interaction.guild.id);

        const embed = new Discord.EmbedBuilder()
            .setColor(data.color)
            .setFooter({ text: data.footer });
        const action = interaction.options.getSubCommand();
        switch (action){
        case "add": {
            const user = interaction.options.getUser("user");
            if (guildBlacklistedUsers.includes(user.id)) return interaction.reply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("admin/blacklist:ALREADY_BLACKLISTED", {
                username: user.tag
            }) });
            await this.client.database.addGuildBlacklistedUser({
                guildID: interaction.guild.id,
                userID: user.id
            });
            interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("admin/blacklist:SUCCESS_MEMBER_ADD", {
                username: user.tag
            }) });
            break;
        }
        case "remove": {
            const user = interaction.options.getUser("user");
            if (!guildBlacklistedUsers.includes(user.id)) return interaction.reply({ content: Constants.Emojis.ERROR + " " + interaction.guild.translate("admin/blacklist:NOT_BLACKLISTED", {
                username: user.tag
            }) });
            await this.client.database.removeGuildBlacklistedUser({
                guildID: interaction.guild.id,
                userID: user.id
            });
            interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("admin/blacklist:SUCCESS_MEMBER_REMOVE", {
                username: user.tag
            }) });
            break;
        }
        case "list": {
            if (guildBlacklistedUsers.length < 1){
                embed.setDescription(interaction.guild.translate("admin/blacklist:EMPTY"));
            } else {
                const users = [];
                await this.client.functions.asyncForEach(guildBlacklistedUsers, async (userID) => {
                    const user = await this.client.users.fetch(userID);
                    users.push(`${user.tag} (${user.toString()})`);
                });
                embed.setDescription(users.join("\n"));
            }
            interaction.reply({ embeds: [embed] });
            break;
        }
        default: {
            interaction.reply({ content: "admin/blacklist:MISSING_TYPE" });
        }
        }

    }

};
