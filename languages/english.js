const { emojis, discord } = require("../config");

module.exports = {

    locale: "en_US",

    utils: {
        prefix: (prefix) => `Hello! Please type **${prefix}help** to see all commands! You can add me to your server with **${prefix}add**.`,
        viewConf: () => `[View the configuration on the dashboard](https://dash.manage-invite.xyz)`,
        conf: {
            title: () => `View the configuration on the dashboard`,
            content: () => `[or on the dashboard](https://dash.manage-invite.xyz)`
        },
        specialMessages: {
            join: {
                oauth2: (user) => `${user} joined the server using OAuth flow.`,
                vanity: (user) => `${user} joined the server using a discord.gg invite defined by the guild owner (or admin).`,
                unknown: (user) => `I can't figure out how ${user} joined the server.`,
                perm: (user) => `${emojis.error} | I need the manage server permissions to know who is the inviter of ${user}.`
            },
            leave: {
                oauth2: (user) => `${user.tag} left the server, they joined via OAuth.`,
                vanity: (user) => `${user.tag} left the server, they joined using a discord.gg invite defined by the server owner (or an admin).`,
                unknown: (user) => `${user.tag} left the server, but I can't figure out how they joined it.`
            }
        }
    },

    errors: {
        missingPerms: (neededPermissions) => `__**${emojis.error} Missing permissions**__\n\nI need the following permissions for this command to work properly: ${neededPermissions.map((p) => "`"+p+"`").join(", ")}`,
        disabled: () => `${emojis.error} | This command is currently disabled!`,
        permLevel: (name) => `${emojis.error} | This command requires the permission level: \`${name}\`!`,
        sendPerm: () => `${emojis.error} | I don't have the permission to send messages in this channel.`
    },

    help: {
        title: () => `ℹ ManageInvite's Help Page`,
        description: (guildName, prefix) => `> ${guildName}'s prefix: **${prefix}** (\`${prefix}setprefix\`)\n> ${guildName}'s language: **English** (\`${prefix}setlang\`)`,
        // Admin
        admin: {
            title: () => `Admin`,
            content: (prefix) => `
        > **${prefix}blacklist [add/remove/list] (@user)**: Add/Remove a user to the blacklist
        > **${prefix}addbonus number @user**: Add bonus invites to a member
        > **${prefix}removebonus number @user**: Remove bonus invites to a member
        > **${prefix}sync-invites**: Synchronize server invites and bot invites
        > **${prefix}removeinvites (@user)**: Remove (server/user) invites
        > **${prefix}restoreinvites (@user)**: Restore (server/user) invites
        > **${prefix}setkeep-ranks**: Configure the "keep-ranks" setting`
        },
        // Ranks
        ranks: {
            title: () => `Ranks reward`,
            content: (prefix) => `
        > **${prefix}addrank number @role**: Add a rank reward
        > **${prefix}removerank @role**: Remove a rank reward
        > **${prefix}ranks**: List the ranks reward`
        },
        // Join DM Messages
        joinDM: {
            title: () => `Join Messages in DM`,
            content: (prefix) => `
        > **${prefix}configdm**: Setup __**join dm**__ messages
        > **${prefix}setdm**: Disable/Enable __**join dm**__ messages
        > **${prefix}testdm**: Test __**join dm**__ messages`
        },
        // Join Messages
        join: {
            title: () => `Join Messages`,
            content: (prefix) => `
        > **${prefix}configjoin**: Setup __**join**__ messages
        > **${prefix}setjoin**: Disable/Enable __**join**__ messages
        > **${prefix}testjoin**: Test __**join**__ messages`
        },
        // Leave Messages
        leave: {
            title: () => `Leave Messages`,
            content: (prefix) => `
        > **${prefix}configleave**: Setup __**leave**__ messages
        > **${prefix}setleave**: Disable/Enable __**leave**__ messages
        > **${prefix}testleave**: Test __**leave**__ messages`
        },
        // Invites
        invites: {
            title: () => `Invites`,
            content: (prefix) => `
        > **${prefix}invite (@user)**: Give you the number of invitations you have or the member mentionned.
        > **${prefix}leaderboard**: Show the invites leaderboard of the server.`,
        },
        // ManageInvite
        manageInvite: {
            title: () => `ManageInvite`,
            content: (prefix) => `
        > **${prefix}botinfos**: Show informations about ManageInvite.
        > **${prefix}ping**: Show the ManageInvite's ping.
        > **${prefix}partners**: Show the ManageInvite's partners.
        > **${prefix}support**: Join the support server.
        > **${prefix}stats**: Display joins stats of your server.
        > **${prefix}add**: Add me to your server.`
        },
        // Others
        tip: (prefix) => `Tip: you can see your configuration with ${prefix}config`,
        links: (clientID) => `[Add me to your server](https://discordapp.com/api/oauth2/authorize?client_id=${clientID}&permissions=8&scope=bot) | [Support server](${discord}) | [Vote for me](https://top.gg/bot/${clientID})`
    },

    botinfos: {
        author: (username) => `${username}'s stats`,
        // Statistics
        statistics: {
            title: () => `📊 Statistics`,
            content: (guilds, users) => `\`Servers: ${guilds}\`\n\`Users: ${users}\``
        },
        // Versions
        versions: {
            title: () => `⚙️ Versions`,
            content: (djs, node) => `\`Discord: v${djs}\`\n\`Node: ${node}\``
        },
        // Shard
        shard: {
            title: (shardID, current) => `${emojis.online} Shard #${shardID} ${current ? `(current)` : ""}`,
            content: (guilds, ping, ram, cachedMembers, cachedGuilds) => `
            \`${guilds}\` servers
            \`${ping}\` ms
            \`${ram}\` mb ram
            \`${cachedMembers}\` cached members
            \`${cachedGuilds}\` cached guilds`,
        }
    },

    invite: {
        description: (member, memberData, isYou, nextRank, role) => `${isYou ? `You have` : `**${member.user.username}** has`} **${memberData.regular + memberData.bonus - memberData.leaves - memberData.fake}** invites! (**${memberData.regular}** regular, **${memberData.bonus}** bonus, **${memberData.fake > 0 ? `-${memberData.fake}` : `${memberData.fake}`}** fake, **${memberData.leaves > 0 ? `-${memberData.leaves}` : `${memberData.leaves}`}** leaves)${nextRank ? `\nYou need **${nextRank.inviteCount - (memberData.regular + memberData.bonus - memberData.leaves - memberData.fake)}** more invites to get the next rank: **${role}**!` : ""}`
    },

    leaderboard: {
        cleared: () => `${emojis.success} | Leaderboard cleared!`,
        user: (user, member, lb) => `${lb} **${user.username}** - **${member.calculatedInvites}** invites (**${member.regular}** regular, **${member.bonus}** bonus, **${member.fake > 0 ? `-${member.fake}` : `${member.fake}`}** fake, **${member.leaves > 0 ? `-${member.leaves}` : `${member.leaves}`}** leaves)`,
        prompt: () => `{{user}}, on which page would you like to go? Write \`cancel\` or \`0\` to cancel.`,
        title: () => `Invites Leaderboard`,
        empty: {
            title: () => `😕 No invite found`,
            content: () => `Start inviting people and you will appear on this page!`
        }
    },

    fetchInvites: {
        success: () => `${emojis.success} Invites successfully fetched!`
    },

    userinfo: {
        title: (user) => `${user.tag} account (${user.id})`,
        fields: {
            // user
            createdAt: {
                title: () => `Creation`
            },
            bot: {
                title: () => `Robot`,
                content: (user) => user.bot ? "Oui" : "Non"
            },
            // member
            joinedAt: {
                title: () => `Join`
            },
            joinWay: {
                title: () => `Join due to`,
                oauth: () => `Oauth invitation (via discordapp.com).`,
                vanity: () => `Customized invite configured by an administrator.`,
                unknown: (user) => `I can't figure out how ${user.username} joined the server.`,
                invite: (user) => user.tag
            },
            invites: {
                title: () => `Invites`,
                content: (inviteData) => `**${inviteData.regular + inviteData.bonus - inviteData.leaves - inviteData.fake}** invites (**${inviteData.regular}** regular, **${inviteData.bonus}** bonus, **${inviteData.fake > 0 ? `-${inviteData.fake}` : `${inviteData.fake}`}** fake, **${inviteData.leaves > 0 ? `-${inviteData.leaves}` : `${inviteData.leaves}`}** leaves)`
            },
            joinOrder: {
                title: () => `Join Order`,
                content: (previous, next, user) => `${previous ? `**${previous.tag}** > ` : ""}**${user.tag}**${next ? ` > **${next.tag}**` : ""}`
            },
            invitedUsers: {
                title: () => `Invited users`,
                premium: () => `:crown: | This feature (view invited users) is only available for premium servers. Get premium here: **<https://docs.manage-invite.xyz/configuration/premium>** !`,
                content: (users, andMore, nobody) => nobody ? "No invited users" : andMore ? `${users.join(", ")}, and more...` : users.join(", ")
            }
        }
    },

    membercount: {
        title: (guildName) => `${guildName}'s MemberCount`,
        description: (guild) => `
        Total of **${guild.members.cache.size}**  members (**${guild.members.cache.filter((m) => !m.user.bot).size}** humans and **${guild.members.cache.filter((m) => m.user.bot).size}** bots)

        ➔ ${emojis.dnd} | ${guild.members.cache.filter((m) => m.presence.status === "dnd"  && !m.user.bot).size} members dnd
        ➔ ${emojis.online} | ${guild.members.cache.filter((m) => m.presence.status === "online" && !m.user.bot).size} members online
        ➔ ${emojis.idle} | ${guild.members.cache.filter((m) => m.presence.status === "idle" && !m.user.bot).size} members idle
        ➔ ${emojis.offline} | ${guild.members.cache.filter((m) => m.presence.status === "offline" && !m.user.bot).size} members offline`
    },

    support: {
        content: () => `:information_source: If you have questions or you need more informations, you can join ManageInvite's Lounge:\n${discord}`
    },

    addbonus: {
        errors: {
            bonus: {
                missing: (prefix) => `${emojis.error} | You must write the number of bonus invites you want to add. (Syntax: ${prefix}addbonus number @member)`,
                incorrect: (prefix) => `${emojis.error} | You must write a __**valid**__ number of bonus invites that you want to add. (Syntax: ${prefix}addbonus number @member)`
            },
            member: {
                missing: (prefix) => `${emojis.error} | You must mention the member to whom you want to add the bonus invites. (Syntax: ${prefix}addbonus number @member)`
            }
        },
        title: () => `📥 Bonus Invites Added`,
        field: (prefix, member) => `Write \`${prefix}invites ${member.user.tag}\` to see the new number of invites of **${member.user.username}**!`
    },

    blacklist: {
        blacklisted: () => `${emojis.error} | You are blacklisted on this server, you can't run this command.`,
        blacklistedMember: (member) => `${member.user.tag} is blacklisted on this server.`,
        action: {
            error: () => `${emojis.error} | You must enter a valid action! (\`add\`, \`remove\` or \`list\`)\n\n:information_source: Users in the blacklist:\n- Won't receive/loose roles\n- Won't appear in the leaderboard\n- Won't have their invites tracked anymore\n- Won't be able to run the \`invites\` command`
        },
        mentions: {
            add: () => `${emojis.error} | You must mention a valid member to add in the blacklist!`,
            remove: () => `${emojis.error} | You must mention a valid member to remove from the blacklist!`
        },
        success: {
            add: (user) => `${emojis.success} | **${user.tag}** was added to the blacklist!`,
            remove: (user) => `${emojis.success} | **${user.tag}** was removed from the blacklist!`
        },
        empty: () => `No blacklisted users!`,
        notFound: (user) => `${emojis.error} | **${user.tag}** is not in the blacklist!`
    },

    removebonus: {
        errors: {
            bonus: {
                missing: (prefix) => `${emojis.error} | You must write the number of bonus invites you want to remove. (Syntax: ${prefix}removebonus number @member)`,
                incorrect: (prefix) => `${emojis.error} | You must write a __**valid**__ number of bonus invites that you want to remove. (Syntax: ${prefix}removebonus number @member)`
            },
            member: {
                missing: (prefix) => `${emojis.error} | You must mention the member to whom you want to remove the bonus invites. (Syntax: ${prefix}removebonus number @member)`
            }
        },
        title: () => `📥 Bonus Invites Removed`,
        field: (prefix, member) => `Write \`${prefix}invites ${member.user.tag}\` to see the new number of invites of **${member.user.username}**!`
    },

    setdmjoin: {
        on: () => `**${emojis.success} | The DM join system is now __ENABLED__!**`,
        off: () => `**${emojis.success} | The DM join system is now __DISABLED__!**`
    },

    setjoin: {
        on: () => `**${emojis.success} | The join system is now __ENABLED__!**`,
        off: () => `**${emojis.success} | The join system is now __DISABLED__!**`
    },

    setleave: {
        on: () => `**${emojis.success} | The leave system is now __ENABLED__!**`,
        off: () => `**${emojis.success} | The leave system is now __DISABLED__!**`
    },

    setkeepranks: {
        premium: (username) => `:crown: | Hey, **${username}**! This feature (keep ranks even if the members don't have enough invites) is only available for premium servers. Get premium here: **<https://docs.manage-invite.xyz/configuration/premium>** !`,
        on: () => `**${emojis.success} | Now, members will __KEEP__ their ranks, even if they don't have enough invites!**`,
        off: () => `**${emojis.success} | Now, members won't __KEEP__ their ranks if they don't have enough invites!**`
    },

    setprefix: {
        missing: () => `${emojis.error} | You must write a prefix!`,
        success: () => `${emojis.success} | Server prefix has been updated!`
    },

    testdmjoin: {
        title: () => `:wrench: DM Join system :`,
        description: () => `If it doesn't work, check the bot permissions or join our [support server](${discord})`,
        fields: {
            enabled: () => `> Enabled:`,
            message: () => `> Message:`
        },
        enabled: (prefix) => `${emojis.success} Join messages in dm enabled. Disable them with \`${prefix}setdmjoin\`.`,
        disabled: (prefix) =>  `${emojis.error} Join messages in dm disabled. Enable them with \`${prefix}setdmjoin\`.`,
        notDefineds: {
            message: (prefix) => `No message defined. Set it with \`${prefix}configdm\`!`
        }
    },

    testjoin: {
        title: () => `:wrench: Join system :`,
        description: () => `If it doesn't work, check the bot permissions or join our [support server](${discord})`,
        fields: {
            enabled: () => `> Enabled:`,
            channel: () => `> Channel:`,
            message: () => `> Message:`
        },
        enabled: (prefix) => `${emojis.success} Join messages enabled. Disable them with \`${prefix}setjoin\`.`,
        disabled: (prefix) =>  `${emojis.error} Join messages disabled. Enable them with \`${prefix}setjoin\`.`,
        notDefineds: {
            message: (prefix) => `No message defined. Set it with \`${prefix}configjoin\`!`,
            channel: (prefix) => `No channel defined. Set it with \`${prefix}configjoin\`!`
        }
    },

    testleave: {
        title: () => `:wrench: Leave system :`,
        description: () => `If it doesn't work, check the bot permissions or join our [support server](${discord})`,
        fields: {
            enabled: () => `> Enabled:`,
            channel: () => `> Channel:`,
            message: () => `> Message:`
        },
        enabled: (prefix) => `${emojis.success} Leave messages enabled. Disable them with \`${prefix}setleave\`.`,
        disabled: (prefix) =>  `${emojis.error} Leave messages disabled. Enable them with \`${prefix}setleave\`.`,
        notDefineds: {
            message: (prefix) => `No message defined. Set it with \`${prefix}configleave\`!`,
            channel: (prefix) => `No channel defined. Set it with \`${prefix}configleave\`!`
        }
    },

    config: {
        title: (guildName) => `${guildName}'s configuration`,
        join: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Join Messages`,
            content: (guild, data) => `
            > Enabled: ${data.guild.join.enabled ? "**yes**" : "**no**"}
            > Message: ${data.guild.join.message ? "**defined**" : "**not defined**."}
            > Channel: ${!data.guild.join.channel ? "**not defined**" : (guild.channels.cache.get(data.guild.join.channel) ? "**defined**" : "**channel not found**")}`
        },
        leave: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Leave Messages`,
            content: (guild, data) => `
            > Enabled: ${data.guild.leave.enabled ? "**yes**" : "**no**"}
            > Message: ${data.guild.leave.message ? "**defined**" : "**not defined**."}
            > Channel: ${!data.guild.leave.channel ? "**not defined**" : (guild.channels.cache.get(data.guild.leave.channel) ? "**defined**" : "**channel not found**")}`
        },
        joinDM: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Join DM Messages`,
            content: (guild, data) => `
            > Enabled: ${data.guild.joinDM.enabled ? "**yes**" : "**no**"}
            > Message: ${data.guild.joinDM.message ? "**defined**" : "**not defined**."}`
        },
    },

    joinDM: {
        premium: (username) => `:crown: | Hey, **${username}**! This feature is only available for premium servers. Get premium here: **<https://docs.manage-invite.xyz/configuration/premium>** !`
    },

    configdmjoin: {
        disable: (prefix) => `Type \`${prefix}setdmjoin\` to disable join messages in dm.`,
        instruct: (str) => `
__**More informations**__
\`\`\`
{user} : The mention of the member that just joined your server.
{user.name} : The name of the member that just joined your server.
{user.tag} : The tag of the member that just joined your server.
{user.createdat} : The account age of the member.
{user.id} : The ID of the member.

{guild} : Name of the server.
{guild.count} : Number of members your server has now.

{inviter} : The mention of the inviter.
{inviter.name} : The name of the inviter.
{inviter.tag} : The tag of the inviter.
{inviter.invites} : The total inviter's invites count.
{inviter.id} : The ID of the inviter.

{invite.code} : The invite code used.
{invite.url} : The invite url used.
{invite.uses} : Number of uses of the invite used.
\`\`\`
Type \`cancel\` to abort. ${str}


:pencil: **| Now write the join DM message... :pencil2:**`,
        cancelled: () => `:x: Cancelled.`,
        success: () => `✅ **| Done successfully...**`,
        title: () => `**Done The join DM Msg Has Been Setup**`,
        fields: {
            message: () => `Message:`,
            testIt: () => `Test it:`,
            cmd: (prefix) => `Use \`${prefix}testdmjoin\` to test the new message.`
        },

    },

    configjoin: {
        disable: (prefix) => `Type \`${prefix}setjoin\` to disable join messages.`,
        instructs: {
            message: (str) => `
__**More informations**__
\`\`\`
{user} : The mention of the member that just joined your server.
{user.name} : The name of the member that just joined your server.
{user.tag} : The tag of the member that just joined your server.
{user.createdat} : The account age of the member.
{user.id} : The ID of the member.

{guild} : Name of the server.
{guild.count} : Number of members your server has now.

{inviter} : The mention of the inviter.
{inviter.name} : The name of the inviter.
{inviter.tag} : The tag of the inviter.
{inviter.invites} : The total inviter's invites count.
{inviter.id} : The ID of the inviter.

{invite.code} : The invite code used.
{invite.url} : The invite url used.
{invite.uses} : Number of uses of the invite used.
\`\`\`
Type \`cancel\` to abort. ${str}


:pencil: **| Now write the join message... :pencil2:**`,
            channel: () => `:scroll: **| Now write the join channel name or mention it... :pencil2:**`
        },
        cancelled: () => `:x: Cancelled.`,
        success: () => `✅ **| Done successfully...**`,
        title: () => `**Done The join Msg Has Been Setup**`,
        fields: {
            message: () => `Message:`,
            channel: () => `Channel:`,
            testIt: () => `Test it:`,
            cmd: (prefix) => `Use \`${prefix}testjoin\` to test the new message.`
        },
        errors: {
            channelNotFound: (channel) => `${emojis.error} | No channel found for \`${channel}\``
        }
    },

    configleave: {
        disable: (prefix) => `Type \`${prefix}setleave\` to disable leave messages.`,
        instructs: {
            message: (str) => `
__**More informations**__
\`\`\`
{user} : The mention of the member that just left your server.
{user.name} : The name of the member that just left your server.
{user.tag} : The tag of the member that just left your server.
{user.createdat} : The account age of the member.
{user.id} : The ID of the member.

{guild} : Name of the server.
{guild.count} : Number of members your server has now.

{inviter} : The mention of the inviter.
{inviter.name} : The name of the inviter.
{inviter.tag} : The tag of the inviter.
{inviter.invites} : The total inviter's invites count.
{inviter.id} : The ID of the inviter.

{invite.code} : The invite code used.
{invite.url} : The invite url used.
{invite.uses} : Number of uses of the invite used.
\`\`\`
Type \`cancel\` to abort. ${str}


:pencil: **| Now write the leave message... :pencil2:**`,
            channel: () => `:scroll: **| Now write the leave channel name or mention it... :pencil2:**`
        },
        cancelled: () => `:x: Cancelled.`,
        success: () => `✅ **| Done successfully...**`,
        title: () => `**Done The leave Msg Has Been Setup**`,
        fields: {
            message: () => `Message:`,
            channel: () => `Channel:`,
            testIt: () => `Test it:`,
            cmd: (prefix) => `Use \`${prefix}testleave\` to test the new message.`
        },
        errors: {
            channelNotFound: (channel) => `${emojis.error} | No channel found for \`${channel}\``
        }
    },

    setlang: {
        invalid: () => `${emojis.error} | You must write a valid language!\n\n:flag_fr: Français (\`fr\`)\n:flag_gb: English (\`en\`)`,
        success: () => `${emojis.success} | Language has beed updated!`
    },

    addrank: {
        errors: {
            inviteCount: {
                missing: (prefix) => `${emojis.error} | You must write the number of invites required to obtain the rank. (Syntax: ${prefix}addrank number @role)`,
                incorrect: (prefix) => `${emojis.error} | You must write a __**valid**__ number of invites required to obtain the rank. (Syntax: ${prefix}addrank number @role)`,
                alreadyExists: (prefix, rank, role) => `${emojis.error} | There is already a defined role for **${rank.inviteCount}** invites (\`@${role.name}\`)! Remove it with \`${prefix}removerank ${role.id}\` then try again!`
            },
            role: {
                missing: (prefix) => `${emojis.error} | Vous devez mentionner le rôle que vous souhaitez ajouter quand le quota d'invitation est atteint. (Syntax: ${prefix}addrank number @role)`,
                alreadyExists: (prefix, rank, role) => `${emojis.error} | This role is already used for the **${rank.inviteCount}** invites! Remove it with \`${prefix}removerank ${role.id}\` then try again!`,
                perm: (role) => `${emojis.error} | My role is not high enough to add the role \`@${role.name}\` to the members! Pleaseput my role up try again!`
            }
        },
        title: () => `🎯 New role added`,
        field: (prefix, role, inviteCount) => `When a member will reach **${inviteCount}** invites, they will obtain \`@${role.name}\`!`
    },

    removerank: {
        errors: {
            role: {
                missing: (prefix) => `${emojis.error} | You must mention the role you want to remove from rewards. (Syntax: ${prefix}removerank @role)`,
                doesntExist: () => `${emojis.error} | This role is not used for rewards!`
            }
        },
        title: () => `🎯 Role removed`,
        field: (prefix, role, inviteCount) => `Role removed from rewards. The members will no longer obtain it when they reach **${inviteCount}** invites.`
    },

    ranks: {
        no: {
            title: () => `🎯 No role`,
            description: (prefix) => `To add a role reward (added when a member reach a certain number of invites), write \`${prefix}addrank number @role\`!`
        },
        title: () => `🎯 Roles rewards`,
        formatRank: (rank, inviteCount) => `${rank} (**${inviteCount}** invites)\n`
    },

    website: {
        doc: {
            variables: () => `https://docs.manage-invite.xyz/configuration/variables`
        },
        utils: {
            members: () => `members`
        },
        conf: {
            title: () => `Configuration`
        },
        selector: {
            title: () => `Selector`,
            manage: () => `Manage`,
            no: {
                title: () => `No server`,
                content: () => `No server found. Please check you're logged with the right account.`
            }
        },
        help: {
            title: () => `Help`,
            doc: () => `Documentation`,
            support: () => `Support server`
        },
        ranks: {
            title: () => `🎯 Role rewards`,
            no: (prefix) => `No role rewards defined. You can configure them with the following commands:${prefix}addrank, ${prefix}removerank and ${prefix}ranks.`,
            fields: {
                role: () => `Rôle`,
                invites: () => `Invitations`
            }
        },
        forms: {
            buttons: {
                enable: () => `Enable the messages`,
                disable: () => `Disable the messages`,
                update: () => `Update the messages`
            },
            basic: {
                title: () => `Basic configuration`,
                language: () => `Language`,
                prefix: () => `Prefix`,
                update: () => `Update`
            },
            join: {
                title: () => `Join messages`,
                message: {
                    title: () => `Message`,
                    default: () => `{user} joined the server! They were invited by **{inviter.tag}** (who has **{inviter.invites}** invites).`
                },
                channel: {
                    title: () => `Channel`
                },
            },
            leave: {
                title: () => `Leave messages`,
                message: {
                    title: () => `Message`,
                    default: () => `{user.tag} left the server. They were invited by **{inviter.tag}** (who has **{inviter.invites}** invites).`
                },
                channel: {
                    title: () => `Channel`
                }
            },
            joinDM: {
                title: () => `Join messages in DM`,
                premium: () => `Feature available for premium servers.`,
                message: {
                    title: () => `Message`,
                    default: () => `Welcome {user} in **{server} ! You were invited by **{inviter.tag}**. Don't forget to read the server rules!`,
                }
            }
        }
    },

    removeinvites: {
        loading: {
            all: (prefix) => `${emojis.loading} | Deleting invitations from the current server.... You can restore them with the command \`${prefix}restore-invites\`!`,
            member: (prefix, member) => `${emojis.loading} | Deleting current invitations of **${member.user.tag}**... You can restore them with the command \`${prefix}restore-invites ${member.user.tag}\` !`
        },
        title: () => `☄️ Invitations reinitalized`,
        titles: {
            all: (prefix) => `${emojis.success} | Server invitations reinitialized! You can restore them with the command \`${prefix}restore-invites\`!`,
            member: (prefix, member) => `${emojis.success} | Invitations of **${member.user.tag}** reinitialized! You can restore them with the command \`${prefix}restore-invites ${member.user.tag}\`!`
        }
    },

    restoreinvites: {
        confirmations: {
            all: (prefix, memberCount) => `${emojis.warn} | Are you sure you want to restore the server invitations? All members will retrieve the invitations they had before the last time the command \`${prefix}remove-invite\` was typed (or 0 if the command was never typed).\n\n:information_source: **Invitations overview**:\nIt will be restored, in total: **${memberCount.regular}** regulars, **${memberCount.bonus}** bonus, **${memberCount.leaves}** leaves, **${memberCount.fake}** fake.\n\n${emojis.success} Type \`-confirm\` to confirm.\n${emojis.error} Type \`cancel\` to abort.`,
            member: (prefix, member) => `${emojis.warn} | Are you sure you want to restore the invitations of **${member.user.tag}**? They will retrieve the invitations they had before the last time the command \`${prefix}remove-invites\` was typed (or 0 if the command was never typed).\n\n:information_source: **Invitations overview**:\nIt will be restored: **${member.data.oldRegular}** regulars, **${member.data.oldBonus}** bonus, **${member.data.oldLeaves}** leaves, **${member.data.oldFake}** fake.\n\n${emojis.success} Type \`-confirm\` to confirm.\n${emojis.error} Type \`cancel\` to abort.`,
            cancelled: () => `${emojis.error} Cancelled.`
        },
        loading: {
            all: () => `${emojis.loading} | Restoring server invitations....`,
            member: (member) => `${emojis.loading} | Restoring invitations of **${member.user.tag}**...`
        },
        title: () => `☄️ Invitations restored`,
        titles: {
            all: () => `${emojis.success} | Server invitations restored!`,
            member: (member) => `${emojis.success} | Invitations of **${member.user.tag}** restored!`
        }
    },

    syncinvites: {
        no: () => `${emojis.error} | No invites to synchronize.`,
        confirmations: {
            all: (inviteCount) => `${emojis.warn} | Are you sure you want to synchronize the server invitations?\n\n:information_source: **Overview of invitations**:\nIt will be restored **${inviteCount}** regular invitations.\n\n${emojis.success} Type \`-confirm\` to confirm.\n${emojis.error} Type \`cancel\` to abort.`,
            cancelled: () => `${emojis.error} Cancelled.`
        },
        title: () => `☄️ Invitations synchronized`,
        titles: {
            all: () => `${emojis.success} | Server invitations synchronized!`
        }
    },

    add: {
        content: (id) => `You can add me to your server by clicking [here](https://discordapp.com/oauth2/authorize?client_id=${id}&scope=bot&permissions=2146958847).`,
        requested: (username) => `Requested by ${username}`
    },

    stats: {
        title: (name, nb) => `Joins on ${name} these last ${nb} days`,
        content: (total, percent, days) => `**${total}** members (i.e. **${percent}%** of the server) have joined the server from ${days[0]} to ${days[1]}:`,
        premium: (username) => `:crown: | Hey, **${username}**! This feature (customized stats period) is only available for premium servers. Get premium here: **<https://docs.manage-invite.xyz/configuration/premium>**!`,
        errors: {
            invalid: () => `${emojis.error} | You must enter a valid number of days (greater than 1 and lower than 1000) to be displayed!`
        }
    },

    monthIndex: [
        "Jan", "Feb", "March", "Apr", "May", "June", "July", "August", "Sept", "Oct", "Nov", "Dec"
    ]

};