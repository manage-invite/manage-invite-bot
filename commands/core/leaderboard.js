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
            permLevel: 0
        });
    }

    async run (message, args, data) {

        const membersData = await this.client.database.fetchGuildMembers(message.guild.id, true);

        let members = [];
        membersData.forEach((member) => {
            if(data.guild.blacklistedUsers.includes(member.user_id)) return;
            members.push({
                invites: (member.invites_regular + parseInt(member.invites_bonus) - member.invites_leaves - member.invites_fake),
                fake: member.invites_fake,
                regular: member.invites_regular,
                bonus: parseInt(member.invites_bonus),
                leaves: member.invites_leaves,
                id: member.user_id
            });
        });
        members = members.filter((m) => m.invites !== 0).sort((a, b) => b.invites - a.invites);

        if(members.length <= 0){
            const embed = new Discord.MessageEmbed()
                .setAuthor(message.translate("core/leaderboard:EMPTY_TITLE"))
                .setDescription(message.translate("core/leaderboard:EMPTY_CONTENT"))
                .setColor(data.color);
            return message.channel.send(embed);
        }

        const embeds = [];
        /* Distributes array */
        let memberCount = 0;
        let totalMemberCount = 0;
        await this.client.functions.asyncForEach(members, async (member) => {
            const index = embeds.length === 0 ? 0 : embeds.length-1;
            let lastEmbed = embeds[index];
            if(lastEmbed && memberCount > 9){
                lastEmbed = new Discord.MessageEmbed();
                embeds[embeds.length] = lastEmbed;
                memberCount = 0;
            } else if(!lastEmbed){
                lastEmbed = new Discord.MessageEmbed();
                embeds[index] = lastEmbed;
            }
            const oldDesc = lastEmbed.description || "";
            let user = this.client.users.cache.get(member.id) || (message.guild.members.cache.get(member.id) || {}).user;
            if(!user) {
                if((members.indexOf(member) < 20)){
                    user = await this.client.users.fetch(member.id);
                } else {
                    user = {
                        username: member.id
                    };
                }
            }
            totalMemberCount++;
            const position =    totalMemberCount === 1 ? "🏆" :
                totalMemberCount === 2 ? "🥈" :
                    totalMemberCount === 3 ? "🥉" :
                        `**${totalMemberCount}.**`;
            lastEmbed.setDescription(`${oldDesc}\n${message.translate("core/leaderboard:USER", {
                username: user.username,
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
