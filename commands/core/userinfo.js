const Command = require("../../structures/Command.js"),
    moment = require("moment"),
    Discord = require("discord.js");
const { uniqBy } = require("lodash");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "userinfo",
            enabled: true,
            aliases: [ "ui", "info", "infos" ],
            clientPermissions: [ "EMBED_LINKS", "MANAGE_GUILD" ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Get user information",
                options: [
                    {
                        type: ApplicationCommandOptionTypes.USER,
                        name: "user",
                        description: "The user to get information about"
                    }
                ]
            }
        });
    }

    async runInteraction (interaction, data) {

        // Fetch user and member
        const user = interaction.options.getUser("user") || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => {});
        const [memberData, memberEvents, guildBlacklistedUsers] = await Promise.all([
            this.client.database.fetchGuildMember({
                userID: user.id,
                guildID: interaction.guild.id,
                storageID: interaction.guild.settings.storageID
            }),
            this.client.database.fetchGuildMemberEvents({
                userID: user.id,
                guildID: interaction.guild.id
            }),
            this.client.database.fetchGuildBlacklistedUsers(interaction.guild.id)
        ]);

        const joins = memberEvents.filter((e) => e.eventType === "join" && e.userID === user.id);

        moment.locale(interaction.guild.settings.language.substr(0, 2));
        const creationDate = moment(user.createdAt, "YYYYMMDD").fromNow();

        const embed = new Discord.MessageEmbed()
            .setAuthor({
                name: interaction.guild.translate("core/userinfo:TITLE", {
                    username: user.tag,
                    userID: user.id
                }),
                iconURL: user.displayAvatarURL()
            })
            .addField(interaction.guild.translate("core/userinfo:BOT_TITLE"), user.bot ? interaction.guild.translate("common:YES") : interaction.guild.translate("common:NO"), true)
            .addField(interaction.guild.translate("core/userinfo:CREATED_AT_TITLE"), creationDate.charAt(0).toUpperCase() + creationDate.substr(1, creationDate.length), true)
            .setColor(data.color)
            .setFooter({ text: data.footer });

        const getJoinWay = async (joinData) => {
            let joinWay = interaction.guild.translate("core/userinfo:JOIN_WAY_UNKNOWN", {
                username: user.username
            });
            if (joinData?.eventType === "join" && joinData?.inviterID){
                const inviter = await this.client.users.fetch(joinData.inviterID).catch(() => {});
                joinWay = inviter.tag;
            } else if (joinData?.type === "vanity"){
                joinWay = interaction.guild.translate("core/userinfo:JOIN_WAY_VANITY");
            } else if (joinData?.type === "oauth" || user.bot){
                joinWay = interaction.guild.translate("core/userinfo:JOIN_WAY_OAUTH");
            }
            return joinWay;
        };
        
        if (member){
            const joinDate = member ? moment(member.joinedAt, "YYYYMMDD").fromNow() : null;
            embed.addField(interaction.guild.translate("core/userinfo:JOINED_AT_TITLE"), joinDate.charAt(0).toUpperCase() + joinDate.substr(1, joinDate.length), true);
        }

        if (memberData){
            const joinWay = await getJoinWay(joins[joins.length - 1]);
            embed.addField(interaction.guild.translate("core/userinfo:INVITES_TITLE"), guildBlacklistedUsers.includes(user.id) ? interaction.guild.translate("admin/blacklist:BLACKLISTED", {
                username: user.tag
            }) : interaction.guild.translate("core/invite:MEMBER_CONTENT", {
                username: user.username,
                inviteCount: memberData.invites,
                regularCount: memberData.regular,
                bonusCount: memberData.bonus,
                fakeCount: memberData.fake > 0 ? `-${memberData.fake}` : memberData.fake,
                leavesCount: memberData.leaves > 0 ? `-${memberData.leaves}` : memberData.leaves
            }))
                .addField(interaction.guild.translate("core/userinfo:JOIN_WAY_TITLE"), joinWay);
        }
        
        if (member){
            await interaction.guild.members.fetch();
            const members = interaction.guild.members.cache.toJSON().sort((a,b) => a.joinedTimestamp - b.joinedTimestamp);
            const joinPos = members.map((u) => u.id).indexOf(member.id);
            const previous = members[joinPos - 1] ? members[joinPos - 1].user : null;
            const next = members[joinPos + 1] ? members[joinPos + 1].user : null;
            embed.addField(interaction.guild.translate("core/userinfo:JOIN_ORDER_TITLE"), `${previous ? `**${previous.tag}** > ` : ""}**${user.tag}**${next ? ` > **${next.tag}**` : ""}`);
        }

        if (memberData.invitedMembers){
            const users = [];
            await this.client.functions.asyncForEach(uniqBy(memberData.invitedMembers, "userID"), async (event) => {
                const fetchedUser = interaction.guild.members.cache.get(event.userID);
                if (fetchedUser) users.push("`"+Discord.Util.escapeMarkdown(fetchedUser.user.tag)+"`");
            });
            const nobody = users.length === 0;
            let andMore = false;
            if (users.length > 20){
                andMore = true;
                users.length = 19;
            }
            embed.addField(interaction.guild.translate("core/userinfo:INVITED_TITLE"),
                nobody ? interaction.guild.translate("core/userinfo:NO_INVITED_USERS") :
                    (andMore ? interaction.guild.translate("core/userinfo:INVITED_USERS_MORE", {
                        list: users.join(", ")
                    }) :
                        users.join(", ")));
        }

        const numberOfJoins = joins.length > 1 ? joins.length : member ? 1 : 0;
        embed.addField(interaction.guild.translate("core/userinfo:NUMBER_JOINS"), numberOfJoins.toString());
                
        if (numberOfJoins > 1){
            embed.addField(interaction.guild.translate("core/userinfo:FIRST_JOIN_WAY_TITLE"), await getJoinWay(joins[0]));
        }

        await interaction.guild.invites.fetch();
        const guildInvites = interaction.guild.invites.cache;
        const userInvites = guildInvites.filter((i) => i?.inviter?.id === user.id);
        embed.addField(interaction.guild.translate("core/userinfo:INVITE_CODES"),
            userInvites.size > 0
                ? userInvites.map((i) => `**${i.code}** | **${i.channel}** | **${i.uses}** ${interaction.guild.translate("common:USES").toLowerCase()}`).join("\n")
                : interaction.guild.translate("core/userinfo:NO_INVITES")
        );

        interaction.reply({ embeds: [embed] });
    }

};
