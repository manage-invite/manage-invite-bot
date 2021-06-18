const Command = require("../../structures/Command.js"),
    moment = require("moment"),
    Discord = require("discord.js");
const { uniqBy } = require("lodash");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "userinfo",
            enabled: true,
            aliases: [ "ui", "info", "infos" ],
            clientPermissions: [ "EMBED_LINKS", "MANAGE_GUILD" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        // Fetch user and member
        const user = message.mentions.users.first() || await this.client.resolveUser(args.join(" ")) || message.author;
        const member = await message.guild.members.fetch(user.id).catch(() => {});
        const [memberData, memberEvents, guildBlacklistedUsers] = await Promise.all([
            this.client.database.fetchGuildMember({
                userID: user.id,
                guildID: message.guild.id,
                storageID: message.guild.settings.storageID
            }),
            this.client.database.fetchGuildMemberEvents({
                userID: user.id,
                guildID: message.guild.id
            }),
            this.client.database.fetchGuildBlacklistedUsers(message.guild.id)
        ]);

        const joins = memberEvents.filter((e) => e.eventType === "join" && e.userID === message.author.id);

        moment.locale(message.guild.settings.language.substr(0, 2));
        const creationDate = moment(user.createdAt, "YYYYMMDD").fromNow();

        const embed = new Discord.MessageEmbed()
            .setAuthor(message.translate("core/userinfo:TITLE", {
                username: user.tag,
                userID: user.id
            }), user.displayAvatarURL())
            .addField(message.translate("core/userinfo:BOT_TITLE"), user.bot ? message.translate("common:YES") : message.translate("common:NO"), true)
            .addField(message.translate("core/userinfo:CREATED_AT_TITLE"), creationDate.charAt(0).toUpperCase() + creationDate.substr(1, creationDate.length), true)
            .setColor(data.color)
            .setFooter(data.footer);

        const getJoinWay = async (joinData) => {
            let joinWay = message.translate("core/userinfo:JOIN_WAY_UNKNOWN", {
                username: user.username
            });
            if (joinData?.eventType === "join" && joinData?.inviterID){
                const inviter = await this.client.users.fetch(joinData.inviterID).catch(() => {});
                joinWay = inviter.tag;
            } else if (joinData?.type === "vanity"){
                joinWay = message.translate("core/userinfo:JOIN_WAY_VANITY");
            } else if (joinData?.type === "oauth" || user.bot){
                joinWay = message.translate("core/userinfo:JOIN_WAY_OAUTH");
            }
            return joinWay;
        };
        
        if (member){
            const joinDate = member ? moment(member.joinedAt, "YYYYMMDD").fromNow() : null;
            embed.addField(message.translate("core/userinfo:JOINED_AT_TITLE"), joinDate.charAt(0).toUpperCase() + joinDate.substr(1, joinDate.length), true);
        }

        if (memberData){
            const joinWay = await getJoinWay(joins[joins.length - 1]);
            embed.addField(message.translate("core/userinfo:INVITES_TITLE"), guildBlacklistedUsers.includes(user.id) ? message.translate("admin/blacklist:BLACKLISTED", {
                username: user.tag
            }) : message.translate("core/invite:MEMBER_CONTENT", {
                username: user.username,
                inviteCount: memberData.invites,
                regularCount: memberData.regular,
                bonusCount: memberData.bonus,
                fakeCount: memberData.fake > 0 ? `-${memberData.fake}` : memberData.fake,
                leavesCount: memberData.leaves > 0 ? `-${memberData.leaves}` : memberData.leaves
            }))
                .addField(message.translate("core/userinfo:JOIN_WAY_TITLE"), joinWay);
        }
        
        if (member){
            await message.guild.members.fetch();
            const members = message.guild.members.cache.array().sort((a,b) => a.joinedTimestamp - b.joinedTimestamp);
            const joinPos = members.map((u) => u.id).indexOf(member.id);
            const previous = members[joinPos - 1] ? members[joinPos - 1].user : null;
            const next = members[joinPos + 1] ? members[joinPos + 1].user : null;
            embed.addField(message.translate("core/userinfo:JOIN_ORDER_TITLE"), `${previous ? `**${previous.tag}** > ` : ""}**${user.tag}**${next ? ` > **${next.tag}**` : ""}`);
        }

        if (memberData.invitedMembers){
            const users = [];
            await this.client.functions.asyncForEach(uniqBy(memberData.invitedMembers, "userID"), async (event) => {
                const fetchedUser = message.guild.members.cache.get(event.userID);
                if (fetchedUser) users.push("`"+Discord.Util.escapeMarkdown(fetchedUser.user.tag)+"`");
            });
            const nobody = users.length === 0;
            let andMore = false;
            if (users.length > 20){
                andMore = true;
                users.length = 19;
            }
            embed.addField(message.translate("core/userinfo:INVITED_TITLE"),
                nobody ? message.translate("core/userinfo:NO_INVITED_USERS") :
                    (andMore ? message.translate("core/userinfo:INVITED_USERS_MORE", {
                        list: users.join(", ")
                    }) :
                        users.join(", ")));
        }

        const numberOfJoins = joins.length > 1 ? joins.length : member ? 1 : 0;
        embed.addField(message.translate("core/userinfo:NUMBER_JOINS"), numberOfJoins.toString());
                
        if (numberOfJoins > 1){
            embed.addField(message.translate("core/userinfo:FIRST_JOIN_WAY_TITLE"), await getJoinWay(joins[0]));
        }

        const guildInvites = await message.guild.fetchInvites();
        const userInvites = guildInvites.filter((i) => i?.inviter?.id === user.id);
        embed.addField(message.translate("core/userinfo:INVITE_CODES"),
            userInvites.size > 0
                ? userInvites.map((i) => `**${i.code}** | **${i.channel}** | **${i.uses}** ${message.translate("common:USES").toLowerCase()}`).join("\n")
                : message.translate("core/userinfo:NO_INVITES")
        );

        message.channel.send({ embeds: [embed] });
    }

};
