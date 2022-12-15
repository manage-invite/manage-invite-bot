const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");
const Constants = require("../../helpers/constants");
const { ButtonStyle } = require("discord.js");

module.exports  = class extends Command {
    constructor (client) {
        super(client, {
            name: "leaderboard",
            enabled: true,
            clientPermissions: [ Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.AddReactions, Discord.PermissionFlagsBits.ManageMessages ],
            permLevel: 0,
            cooldown: () => 5,

            slashCommandOptions: {
                description: "Get the invites leaderboard",

                options: [
                    {
                        name: "with-ids",
                        description: "Whether to show the IDs of the user on the leaderboard",
                        type: Discord.ApplicationCommandOptionType.Boolean
                    }
                ]
            }
        });
    }

    async generateEmbeds (members, guild, showIDs) {
        const embeds = [];
        /* Distributes array */
        let memberCount = 0;
        let totalMemberCount = 0;
        await this.client.functions.asyncForEach(members, async (member) => {
            const index = embeds.length === 0 ? 0 : embeds.length-1;
            let lastEmbed = embeds[index];
            if (lastEmbed && memberCount > 9){
                lastEmbed = new Discord.EmbedBuilder()
                    .setColor(Constants.Embed.COLOR);
                embeds[embeds.length] = lastEmbed;
                memberCount = 0;
            } else if (!lastEmbed){
                lastEmbed = new Discord.EmbedBuilder()
                    .setColor(Constants.Embed.COLOR);
                embeds[index] = lastEmbed;
            }
            const oldDesc = lastEmbed.description || "";
            let user = this.client.users.cache.get(member.id) || (guild.members.cache.get(member.id) || {}).user;
            if (!user) {
                if ((members.indexOf(member) < 20)){
                    user = await this.client.users.fetch(member.id);
                } else {
                    user = {
                        id: member.id
                    };
                }
            }
            totalMemberCount++;
            const position =    totalMemberCount === 1 ? "🏆" :
                totalMemberCount === 2 ? "🥈" :
                    totalMemberCount === 3 ? "🥉" :
                        `**${totalMemberCount}.**`;
            lastEmbed.setDescription(`${oldDesc}\n${guild.translate("core/leaderboard:USER", {
                username: user.username ? user.username + (showIDs ? ` ${user.id} ` : "") : user.id,
                position,
                invites: member.invites,
                regular: member.regular,
                fake: (member.fake > 0 ? `-${member.fake}` : member.fake),
                leaves: (member.leaves > 0 ? `-${member.leaves}` : member.leaves),
                bonus: member.bonus
            })}\n`);
            memberCount++;
        });
        return embeds;
    }

    async runInteraction (interaction, data) {
        
        const showIDs = interaction.options.getBoolean("showIDs");

        const [blacklistedUsers, membersData] = await Promise.all([
            this.client.database.fetchGuildBlacklistedUsers(interaction.guildId),
            this.client.database.fetchGuildLeaderboard(interaction.guildId, interaction.guild.settings.storageID)
        ]);

        let members = [];
        membersData.forEach((member) => {
            if (blacklistedUsers.includes(member.userID)) return;
            members.push({
                invites: member.invites,
                fake: member.fake,
                regular: member.regular,
                bonus: member.bonus,
                leaves: member.leaves,
                id: member.userID
            });
        });
        members = members.filter((m) => m.invites !== 0).sort((a, b) => b.invites - a.invites);

        if (members.length <= 0){
            const embed = new Discord.EmbedBuilder()
                .setAuthor({
                    name: interaction.guild.translate("core/leaderboard:EMPTY_TITLE")
                })
                .setDescription(interaction.guild.translate("core/leaderboard:EMPTY_CONTENT"))
                .setColor(data.color);
            return interaction.reply({ embeds: [embed] });
        }

        const embeds = await this.generateEmbeds(members, interaction.guild, showIDs);

        const randomID = Math.random().toString(36).substr(2, 9);
        
        const previousButton = new Discord.EmbedBuilder()
            .setLabel("Previous Page")
            .setCustomId(`prev_${randomID}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
        
        const nextButton = new Discord.EmbedBuilder()
            .setLabel("Next Page")
            .setCustomId(`next_${randomID}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!embeds[1]);
        
        const calculateRow = () => new Discord.MessageActionRow()
            .addComponents([
                previousButton,
                nextButton
            ]);

        let currentEmbedIndex = 0;

        await interaction.reply({ embeds: [embeds[currentEmbedIndex]], components: [calculateRow()] });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) => i.customId.endsWith(randomID), // make sure we are listening to the right leaderboard message
            time: 60000
        });

        collector.on("collect", (component) => {
            if (component.user.id !== interaction.user.id) {
                component.reply({ content: interaction.guild.translate("core/leaderboard:ERR_INTERACT"), ephemeral: true });
                return;
            }
            const action = component.customId.split("_")[0];
            if (action === "prev") {
                if (currentEmbedIndex > 0) {
                    currentEmbedIndex--;
                    if (currentEmbedIndex === 0) previousButton.setDisabled(true);
                    nextButton.setDisabled(false);
                    interaction.editReply({ embeds: [embeds[currentEmbedIndex]], components: [calculateRow()] });
                }
            } else if (action === "next") {
                if (currentEmbedIndex < embeds.length - 1) {
                    currentEmbedIndex++;
                    if (currentEmbedIndex === embeds.length - 1) nextButton.setDisabled(true);
                    previousButton.setDisabled(false);
                    interaction.editReply({ embeds: [embeds[currentEmbedIndex]], components: [calculateRow()] });
                }
            }
            component.deferUpdate();
        });

        collector.on("end", () => {
            interaction.editReply({ components: [] });
        });
    }

};
