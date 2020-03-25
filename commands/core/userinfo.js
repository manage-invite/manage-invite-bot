const Command = require("../../structures/Command.js"),
moment = require("moment"),
Discord = require("discord.js");

class Userinfo extends Command {
    constructor (client) {
        super(client, {
            name: "userinfo",
            enabled: true,
            aliases: [ "ui", "info", "infos" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        // Fetch user and member
        let user = message.mentions.users.first() || await this.client.resolveUser(args.join(" ")) || message.author;
        let member = await message.guild.members.fetch(user.id).catch(() => {});
        let memberData = member ? await this.client.database.fetchMember(member.id, member.guild.id) : null;

        let fields = message.language.userinfo.fields;

        moment.locale(data.guild.language.substr(0, 2));

        let creationDate = moment(user.createdAt, "YYYYMMDD").fromNow();
        let joinDate = member ? moment(member.joinedAt, "YYYYMMDD").fromNow() : null;

        let embed = new Discord.MessageEmbed()
        .setAuthor(message.language.userinfo.title(user), user.displayAvatarURL())
        .addField(fields.bot.title(), fields.bot.content(user), true)
        .addField(fields.createdAt.title(), creationDate.charAt(0).toUpperCase() + creationDate.substr(1, creationDate.length), true)
        .setColor(data.color)
        .setFooter(data.footer);
        
        if(member){
            let joinData = memberData.joinData || (memberData.invitedBy ? { type: "normal", invite: { inviter: memberData.joinData.invitedBy } } : { type: "unknown" } );
            let joinWay = fields.joinWay.unknown(user);
            if(joinData.type === "normal" && joinData.inviteData){
                let inviter = await this.client.users.fetch(joinData.inviteData.inviter);
                joinWay = fields.joinWay.invite(inviter);
            } else if(joinData.type === "vanity"){
                joinWay = fields.joinWay.vanity();
            } else if(joinData.type === "oauth" || user.bot){
                joinWay = fields.joinWay.oauth();
            }
            let guild = await message.guild.fetch();
            let members = guild.members.cache.array().sort((a,b) => a.joinedTimestamp - b.joinedTimestamp);
            let joinPos = members.map((u) => u.id).indexOf(member.id);
            let previous = members[joinPos - 1] ? members[joinPos - 1].user : null;
            let next = members[joinPos + 1] ? members[joinPos + 1].user : null;
            embed.addField(fields.joinedAt.title(), joinDate.charAt(0).toUpperCase() + joinDate.substr(1, joinDate.length), true)
            .addField(fields.invites.title(), data.guild.blacklistedUsers.includes(member.id) ? message.language.blacklist.blacklistedMember(member) : fields.invites.content(memberData))
            .addField(fields.joinWay.title(), joinWay)
            .addField(fields.joinOrder.title(), fields.joinOrder.content(previous, next, user));
        }

        if(data.guild.premium && memberData.invitedUsers){
            let nobody = memberData.invitedUsers.length === 0;
            let andMore = false;
            if(memberData.invitedUsers.length > 20){
                andMore = true;
                memberData.invitedUsers.length = 19;
            }
            const users = [];
            await this.client.functions.asyncForEach(memberData.invitedUsers, async (user) => {
                const fetchedUser = await message.guild.members.cache.get(user);
                if(fetchedUser) users.push(fetchedUser.toString());
            });
            embed.addField(fields.invitedUsers.title(), fields.invitedUsers.content(users, andMore, nobody));
        } else {
            embed.addField(fields.invitedUsers.title(), fields.invitedUsers.premium(message.author.username));
        }
        
        message.channel.send(embed);
    }

};

module.exports = Userinfo;