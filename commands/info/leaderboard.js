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

        let membersData = await this.client.guildMembersData.find({ guildID: message.guild.id }).lean();

        if(args[0] === "reset"){
            this.client.guildMembersData.delete({ guildID: message.guild.id });
            return message.channel.send(message.language.leaderboard.cleared());
        }

        let members = [];
        membersData.filter((m) => !m.bot).forEach((member) => {
            members.push({
                calculatedInvites: (member.invites + member.bonus - member.leaves - member.fake),
                fake: member.fake,
                invites: member.invites,
                bonus: member.bonus,
                leaves: member.leaves,
                id: member.id
            });
        });
        members = members.sort((a, b) => b.calculatedInvites - a.calculatedInvites);

        const embeds = [];
        /* Distributes array */
        let i = 0;
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
            let user = this.client.users.get(member.id) || (message.guild.members.get(member.id) || {}).user;
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
        .setColor(data.color)
        .setFooter(data.footer)
        .setClientAssets({ prompt: message.language.leaderboard.prompt() })
        .setTitle(message.language.leaderboard.title());

        pagination.build();
    }

};

module.exports = Leaderboard;