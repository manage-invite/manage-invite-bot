const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Pagination = require("discord-paginationembed");

module.exports  = class extends Command {
    constructor (client) {
        super(client, {
            name: "leaderboard",
            enabled: true,
            aliases: [ "top", "lb" ],
            clientPermissions: [ "EMBED_LINKS", "ADD_REACTIONS", "MANAGE_MESSAGES" ],
            permLevel: 0,
            cooldown: () => 5
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

        const pagination = new Pagination.Embeds()
            .setArray(embeds)
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.channel)
            .setPageIndicator(false)
            .setPage(1)
            .setDisabledNavigationEmojis(["delete"])
            .setColor(data.color)
            .setFooter(data.footer)
            .setClientAssets({
                prompt: message.translate("core/leaderboard:PROMPT", {
                    skipInterpolation: true
                })
            })
            .setTitle(message.translate("core/leaderboard:TITLE"));

        pagination.build();
    }

};
