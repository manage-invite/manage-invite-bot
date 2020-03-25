const Command = require("../../structures/Command.js"),
Discord = require("discord.js"),
Pagination = require("discord-paginationembed");

class Leaderboard extends Command {
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

        let membersData = await this.client.database.fetchMembers(message.guild.id, true);
        if(membersData.length <= 0){
            let embed = new Discord.MessageEmbed()
            .setAuthor(message.language.leaderboard.empty.title())
            .setDescription(message.language.leaderboard.empty.content())
            .setColor(data.color);
            return message.channel.send(embed);
        }

        let members = [];
        membersData.forEach((member) => {
            if(data.guild.blacklistedUsers.includes(member.user_id)) return;
            members.push({
                calculatedInvites: (member.invites_regular + parseInt(member.invites_bonus) - member.invites_leaves - member.invites_fake),
                fake: member.invites_fake,
                regular: member.invites_regular,
                bonus: parseInt(member.invites_bonus),
                leaves: member.invites_leaves,
                id: member.user_id
            });
        });
        members = members.filter((m) => m.calculatedInvites !== 0).sort((a, b) => b.calculatedInvites - a.calculatedInvites);

        const embeds = [];
        /* Distributes array */
        let memberCount = 0;
        let totalMemberCount = 0;
        await this.client.functions.asyncForEach(members, async (member) => {
            let index = embeds.length === 0 ? 0 : embeds.length-1;
            let lastEmbed = embeds[index];
            if(lastEmbed && memberCount > 9){
                lastEmbed = new Discord.MessageEmbed();
                embeds[embeds.length] = lastEmbed;
                memberCount = 0;
            } else if(!lastEmbed){
                lastEmbed = new Discord.MessageEmbed();
                embeds[index] = lastEmbed;
            }
            let oldDesc = lastEmbed.description || "";
            let user = this.client.users.cache.get(member.id) || (message.guild.members.cache.get(member.id) || {}).user;
            if(!user) user = await this.client.users.fetch(member.id);
            totalMemberCount++;
            let lb =    totalMemberCount === 1 ? "🏆" :
                        totalMemberCount === 2 ? "🥈" :
                        totalMemberCount === 3 ? "🥉" :
                        `**${totalMemberCount}.**`
            lastEmbed.setDescription(`${oldDesc}\n${message.language.leaderboard.user(user, member, lb)}\n`);
            memberCount++;
        });

        let pagination = new Pagination.Embeds()
        .setArray(embeds)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setPageIndicator(false)
        .setPage(1)
        .setDisabledNavigationEmojis(['DELETE'])
        .setColor(data.color)
        .setFooter(data.footer)
        .setClientAssets({ prompt: message.language.leaderboard.prompt() })
        .setTitle(message.language.leaderboard.title());

        pagination.build();
    }

};

module.exports = Leaderboard;