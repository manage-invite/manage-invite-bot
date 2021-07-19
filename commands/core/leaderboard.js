const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

module.exports  = class extends Command {
    constructor (client) {
        super(client, {
            name: "leaderboard",
            enabled: true,
            aliases: [ "top", "lb" ],
            clientPermissions: [ "EMBED_LINKS", "ADD_REACTIONS", "MANAGE_MESSAGES" ],
            permLevel: 0,
            cooldown: () => 5,

            slashCommandOptions: {
                description: "Get the invites leaderboard"
            }
        });
    }

    async run (message, args, data) {

        const showIDs = message.content.includes("-id");

        const [blacklistedUsers, membersData] = await Promise.all([
            this.client.database.fetchGuildBlacklistedUsers(message.guild.id),
            this.client.database.fetchGuildLeaderboard(message.guild.id, message.guild.settings.storageID)
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
            const embed = new Discord.MessageEmbed()
                .setAuthor(message.translate("core/leaderboard:EMPTY_TITLE"))
                .setDescription(message.translate("core/leaderboard:EMPTY_CONTENT"))
                .setColor(data.color);
            return message.channel.send({ embeds: [embed] });
        }

        const embeds = [];
        /* Distributes array */
        let memberCount = 0;
        let totalMemberCount = 0;
        await this.client.functions.asyncForEach(members, async (member) => {
            const index = embeds.length === 0 ? 0 : embeds.length-1;
            let lastEmbed = embeds[index];
            if (lastEmbed && memberCount > 9){
                lastEmbed = new Discord.MessageEmbed();
                embeds[embeds.length] = lastEmbed;
                memberCount = 0;
            } else if (!lastEmbed){
                lastEmbed = new Discord.MessageEmbed();
                embeds[index] = lastEmbed;
            }
            const oldDesc = lastEmbed.description || "";
            let user = this.client.users.cache.get(member.id) || (message.guild.members.cache.get(member.id) || {}).user;
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
            lastEmbed.setDescription(`${oldDesc}\n${message.translate("core/leaderboard:USER", {
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
        
        const previousButton = new Discord.MessageButton()
            .setLabel("Previous Page")
            .setCustomId("prev")
            .setStyle("PRIMARY")
            .setDisabled(true);
        
        const nextButton = new Discord.MessageButton()
            .setLabel("Next Page")
            .setCustomId("next")
            .setStyle("PRIMARY")
            .setDisabled(!embeds[1]);
        
        const calculateRow = () => new Discord.MessageActionRow()
            .addComponents([
                previousButton,
                nextButton
            ]);

        let currentEmbedIndex = 0;

        const sentLeaderboard = await message.channel.send({ embeds: [embeds[currentEmbedIndex]], components: [calculateRow()] });

        const collector = message.channel.createMessageComponentCollector({
            filter: () => true,
            time: 60000
        });

        collector.on("collect", (component) => {
            if (component.user.id !== message.author.id) {
                component.reply({ content: `You can not interact with the leaderboard asked by ${message.author.username}`, ephemeral: true });
                return;
            }
            if (component.customId === "prev") {
                if (currentEmbedIndex > 0) {
                    currentEmbedIndex--;
                    if (currentEmbedIndex === 0) previousButton.setDisabled(true);
                    nextButton.setDisabled(false);
                    sentLeaderboard.edit({ embeds: [embeds[currentEmbedIndex]], components: [calculateRow()] });
                }
            } else if (component.customId === "next") {
                if (currentEmbedIndex < embeds.length - 1) {
                    currentEmbedIndex++;
                    if (currentEmbedIndex === embeds.length - 1) nextButton.setDisabled(true);
                    previousButton.setDisabled(false);
                    sentLeaderboard.edit({ embeds: [embeds[currentEmbedIndex]], components: [calculateRow()] });
                }
            }
            component.deferUpdate();
        });

        collector.on("end", () => {
            sentLeaderboard.edit({ components: [] });
        });
    }

};
