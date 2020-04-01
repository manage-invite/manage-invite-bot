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
        const user = message.mentions.users.first() || await this.client.resolveUser(args.join(" ")) || message.author;
        const member = await message.guild.members.fetch(user.id).catch(() => {});
        const memberData = member ? await this.client.database.fetchMember(member.id, member.guild.id) : null;

        moment.locale(data.guild.language.substr(0, 2));
        const creationDate = moment(user.createdAt, "YYYYMMDD").fromNow();
        const joinDate = member ? moment(member.joinedAt, "YYYYMMDD").fromNow() : null;

        const embed = new Discord.MessageEmbed()
        .setAuthor(message.translate("core/userinfo:TITLE", {
            username: user.tag
        }), user.displayAvatarURL())
        .addField(message.translate("core/userinfo:BOT_TITLE"), user.bot ? message.translate("common:YES") : message.translate("common:NO"), true)
        .addField(message.translate("core/userinfo:CREATED_AT_TITLE"), creationDate.charAt(0).toUpperCase() + creationDate.substr(1, creationDate.length), true)
        .setColor(data.color)
        .setFooter(data.footer);
        
        if(member){
            const joinData = memberData.joinData || (memberData.invitedBy ? { type: "normal", invite: { inviter: memberData.joinData.invitedBy } } : { type: "unknown" } );
            const joinWay = message.translate("core/userinfo:JOIN_WAY_UNKNOWN", {
                user: user.username
            });
            if(joinData.type === "normal" && joinData.inviteData){
                const inviter = await this.client.users.fetch(joinData.inviteData.inviter);
                joinWay = inviter.tag;
            } else if(joinData.type === "vanity"){
                joinWay = fields.joinWay.vanity();
            } else if(joinData.type === "oauth" || user.bot){
                joinWay = fields.joinWay.oauth();
            }
            const guild = await message.guild.fetch();
            const members = guild.members.cache.array().sort((a,b) => a.joinedTimestamp - b.joinedTimestamp);
            const joinPos = members.map((u) => u.id).indexOf(member.id);
            const previous = members[joinPos - 1] ? members[joinPos - 1].user : null;
            const next = members[joinPos + 1] ? members[joinPos + 1].user : null;
            embed.addField(fields.joinedAt.title(), joinDate.charAt(0).toUpperCase() + joinDate.substr(1, joinDate.length), true)
            .addField(message.translate("core/userinfo:INVITES_TITLE"), data.guild.blacklistedUsers.includes(member.id) ? message.translate("admin/blacklist:BLACKLISTED", {
                username: member.user.tag
            }) : message.translate("core/invite:MEMBER_CONTENT", {
                username: member.user.username,
                inviteCount: memberData.calcInvites(),
                regularCount: memberData.regular,
                bonusCount: memberData.bonus,
                fakeCount: memberData.fake > 0 ? `-${memberData.fake}` : memberData.fake,
                leavesCount: memberData.leaves > 0 ? `-${memberData.leaves}` : memberData.leaves
            }))
            .addField(message.translate("core/userinfo:JOIN_WAY_TITLE"), joinWay)
            .addField(message.translate("core/userinfo:JOIN_ORDER_TITLE"), `${previous ? `**${previous.tag}** > ` : ""}**${user.tag}**${next ? ` > **${next.tag}**` : ""}`);
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