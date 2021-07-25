const { Permissions } = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (member) {

        const startAt = Date.now();
        let logMessage = "----------\n";

        if (!this.client.fetched) return;
        logMessage += `Join of ${member.user.tag} | (${member.id})\n`;
        logMessage += `Guild: ${member.guild.id}\n`;

        const fetchGuildSubscriptionStart = Date.now();
        const guildSubscriptions = await this.client.database.fetchGuildSubscriptions(member.guild.id);
        logMessage += `Fetch guild subscriptions: ${Date.now()-fetchGuildSubscriptionStart}ms\n`;

        const isPremium = guildSubscriptions.some((sub) => new Date(sub.expiresAt).getTime() > (Date.now()-3*24*60*60*1000));
        if (!isPremium) return;

        const fetchGuildStartAt = Date.now();
        // Fetch guild and member data from the db
        const [
            guildSettings,
            guildBlacklistedUsers,
            guildPlugins,
            guildAlerts
        ] = await Promise.all([
            this.client.database.fetchGuildSettings(member.guild.id),
            this.client.database.fetchGuildBlacklistedUsers(member.guild.id),
            this.client.database.fetchGuildPlugins(member.guild.id),
            this.client.database.fetchGuildAlerts(member.guild.id)
        ]);
        logMessage += `Fetch guild data: ${Date.now()-fetchGuildStartAt}ms\n`;

        member.guild.settings = guildSettings;
        
        /* Find who is the inviter */

        let invite = null;
        let vanity = false;
        let oauth = false;
        let perm = false;

        if (!member.guild.me) {
            const fetchMyselfStart = Date.now();
            await member.guild.members.fetch({
                user: this.client.user.id,
                cache: true
            }).catch(() => {});
            logMessage += `Fetch myself: ${Date.now()-fetchMyselfStart}ms\n`;
        }
        if (!member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) perm = true;

        if (member.user.bot){
            oauth = true;
        } else if (!perm) {
            const fetchGuildInvitesStart = Date.now();
            // Fetch the current invites of the guild
            await member.guild.invites.fetch().catch(() => {});
            const guildInvites = this.client.functions.generateInvitesCache(member.guild.invites.cache);
            logMessage += `Fetch guild invites: ${Date.now()-fetchGuildInvitesStart}ms\n`;
            // Fetch the invites of the guild BEFORE that the member has joined
            const oldGuildInvites = this.client.invitations[member.guild.id];
            if (guildInvites && oldGuildInvites){
                // Update the cache
                this.client.invitations[member.guild.id] = guildInvites;
                // Find the invitations which doesn't have the same number of use
                let inviteUsed = guildInvites.find((i) => oldGuildInvites.get(i.code) && ((Object.prototype.hasOwnProperty.call(oldGuildInvites.get(i.code), "uses") ? oldGuildInvites.get(i.code).uses : "Infinite") < i.uses));
                if ((this.client.function.isEqual(oldGuildInvites.map((i) => `${i.code}|${i.uses}` ).sort(), guildInvites.map((i) => `${i.code}|${i.uses}` ).sort())) && !inviteUsed && member.guild.features.includes("VANITY_URL")){
                    vanity = true;
                } else if (!inviteUsed){
                    const newAndUsed = guildInvites.filter((i) => !oldGuildInvites.get(i.code) && i.uses === 1);
                    if (newAndUsed.size === 1){
                        inviteUsed = newAndUsed.first();
                    }
                }
                if (inviteUsed && !vanity) invite = inviteUsed;
            } else if (guildInvites && !oldGuildInvites) {
                this.client.invitations[member.guild.id] = guildInvites;
            }
            if (!invite && guildInvites){
                const targetInvite = guildInvites.some((i) => i.targetUser && (i.targetUser.id === member.id));
                if (targetInvite.uses === 1) {
                    invite = targetInvite;
                }
            }
        }

        logMessage += `Vanity: ${vanity}\nInvite: ${!!invite}\nPerm: ${perm}\n`;

        const resolveUserStart = Date.now();
        const inviter = invite && invite.inviter ? await this.client.resolveUser(invite.inviter.id) : null;
        logMessage += `Resolve user : ${Date.now()-resolveUserStart}ms\n`;

        const inviterDataStart = Date.now();
        const inviterData = inviter ? await this.client.database.fetchGuildMember({
            userID: inviter.id,
            guildID: member.guild.id,
            storageID: guildSettings.storageID
        }) : null;
        logMessage += `Fetch inviter member data: ${Date.now()-inviterDataStart}ms\n`;

        const fetchEventsStartAt = Date.now();
        const [inviterEvents, memberEvents] = await Promise.all([
            inviter ? this.client.database.fetchGuildMemberEvents({
                userID: inviter.id,
                guildID: member.guild.id 
            }) : null,
            this.client.database.fetchGuildMemberEvents({
                userID: member.id,
                guildID: member.guild.id
            })
        ]);
        logMessage += `Fetch member events: ${Date.now()-fetchEventsStartAt}ms\n`;

        if (inviter && guildBlacklistedUsers.includes(inviter.id)) {
            logMessage += "Blacklisted: true\n----------";
            console.log(logMessage);
            return;
        }

        // If we know who invited the member
        if (inviter){

            const previousInviteCount = inviterData.invites;
            let newInviteCount = inviterData.invites;

            if (inviterData.notCreated) {
                const createMemberStart = Date.now();
                await this.client.database.createGuildMember({
                    userID: inviter.id,
                    guildID: member.guild.id,
                    storageID: guildSettings.storageID
                });
                logMessage += `Create member: ${Date.now()-createMemberStart}ms\n`;
            }

            // We look for the member in the server members
            const fetchInvitedMemberStart = Date.now();
            const inviterMember = member.guild.members.cache.get(inviter.id) || await member.guild.members.fetch(inviter.id).catch(() => {});
            logMessage += `Fetch invited member: ${Date.now()-fetchInvitedMemberStart}ms\n`;

            let joinFake = false;

            if (inviterMember) {
                // If the member had previously invited this member and they have left
                const lastJoinData = inviterEvents.filter((j) => j.eventType === "join" && j.guildID === member.guild.id && j.inviterID === inviterMember.id && j.userID === member.id && j.storageID === guildSettings.storageID)[0];
                if (lastJoinData){
                    this.client.database.addInvites({
                        userID: inviter.id,
                        guildID: member.guild.id,
                        storageID: guildSettings.storageID,
                        number: -1,
                        type: "leaves"
                    });
                    inviterData.leaves--;
                    newInviteCount++;
                    this.client.database.addInvites({
                        userID: inviter.id,
                        guildID: member.guild.id,
                        storageID: guildSettings.storageID,
                        number: 1,
                        type: "fake"
                    });
                    inviterData.fake++;
                    newInviteCount--;
                } else if (inviter.id === member.id) {
                    this.client.database.addInvites({
                        userID: inviter.id,
                        guildID: member.guild.id,
                        storageID: guildSettings.storageID,
                        number: 1,
                        type: "fake"
                    });
                    inviterData.fake++;
                    newInviteCount--;
                } else {
                    const fakeThreshold = guildSettings.fakeThreshold;
                    if (fakeThreshold) {
                        const inThreshold = (member.user.createdTimestamp + (fakeThreshold * 24 * 60 * 60 * 1000)) > Date.now();
                        if (inThreshold) {
                            joinFake = true;
                            this.client.database.addInvites({
                                userID: inviter.id,
                                guildID: member.guild.id,
                                storageID: guildSettings.storageID,
                                number: 1,
                                type: "fake"
                            });
                            inviterData.fake++;
                            newInviteCount--;
                        }
                    }
                }
            }

            this.client.database.addInvites({
                userID: inviter.id,
                guildID: member.guild.id,
                storageID: guildSettings.storageID,
                number: 1,
                type: "regular"
            });
            inviterData.regular++;
            newInviteCount++;

            if (previousInviteCount < newInviteCount) {
                const guildAlertNewCount = guildAlerts.find((alert) => alert.inviteCount === newInviteCount && alert.type === "up");
                if (guildAlertNewCount) {
                    const alertMessage = this.client.functions.formatMessage(guildAlertNewCount.message, inviterMember, null, (guildSettings.language || "english").substr(0, 2), null, true, newInviteCount);
                    const alertChannel = this.client.channels.cache.get(guildAlertNewCount.channelID);
                    if (alertChannel) alertChannel.send(alertMessage);
                }
            }

            this.client.database.createGuildMemberEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "join",
                eventDate: new Date(),
                joinType: "normal",
                inviterID: inviter.id,
                inviteData: {
                    uses: invite.uses,
                    url: invite.url,
                    code: invite.code,
                    inviter: inviter.id,
                    channel: invite.channel.toString()
                },
                joinFake,
                storageID: guildSettings.storageID
            });
        } else if (oauth){
            this.client.database.createGuildMemberEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "join",
                eventDate: new Date(),
                joinType: "oauth",
                storageID: guildSettings.storageID
            });
        } else if (vanity){
            this.client.database.createGuildMemberEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "join",
                eventDate: new Date(),
                joinType: "vanity",
                storageID: guildSettings.storageID
            });
        } else if (perm){
            this.client.database.createGuildMemberEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "join",
                eventDate: new Date(),
                joinType: "perm",
                storageID: guildSettings.storageID
            });
        } else {
            this.client.database.createGuildMemberEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "join",
                eventDate: new Date(),
                joinType: "unknown",
                storageID: guildSettings.storageID
            });
        }

        const memberNumJoins = memberEvents.filter((e) => e.eventType === "join" && e.userID === member.id).length + 1;
        const joinDM = guildPlugins.find((plugin) => plugin.pluginName === "joinDM")?.pluginData;
        // DM Join messages
        if (joinDM?.enabled && joinDM.mainMessage){
            if (invite){
                const formattedMessage = this.client.functions.formatMessage(
                    joinDM.mainMessage,
                    member,
                    memberNumJoins,
                    (guildSettings.language || "english").substr(0, 2),
                    {
                        inviter,
                        inviterData,
                        invite
                    });
                member.send(formattedMessage).catch(() => {});
            } else if (vanity){
                const formattedMessage = this.client.functions.formatMessage(
                    (joinDM.vanityMessage || member.guild.translate("misc:JOIN_DM_VANITY_DEFAULT")),
                    member,
                    null,
                    (guildSettings.language || "english").substr(0, 2),
                    null
                );
                member.send(formattedMessage).catch(() => {});
            } else {
                const formattedMessage = this.client.functions.formatMessage(
                    (joinDM.unknownMessage || member.guild.translate("misc:JOIN_DM_UNKNOWN_DEFAULT")),
                    member,
                    null,
                    (guildSettings.language || "english").substr(0, 2),
                    null
                );
                member.send(formattedMessage).catch(() => {});
            }
        }

        const join = guildPlugins.find((plugin) => plugin.pluginName === "join")?.pluginData;
        // Join messages
        if (join?.enabled && join.mainMessage && join.channel){
            logMessage += "Join: true\n";
            const channel = member.guild.channels.cache.get(join.channel);
            if (!channel) return;
            logMessage += "Join: sent\n";
            if (invite){
                const formattedMessage = this.client.functions.formatMessage(
                    join.mainMessage,
                    member,
                    memberNumJoins,
                    (guildSettings.language || "english").substr(0, 2),
                    {
                        inviter,
                        inviterData,
                        invite
                    });
                channel.send(formattedMessage);
            } else if (vanity){
                const formattedMessage = this.client.functions.formatMessage(
                    (join.vanityMessage || member.guild.translate("misc:JOIN_VANITY_DEFAULT")),
                    member,
                    null,
                    (guildSettings.language || "english").substr(0, 2),
                    null
                );
                channel.send(formattedMessage);
            } else if (oauth){
                const formattedMessage = this.client.functions.formatMessage(
                    (join.oauth2Message || member.guild.translate("misc:JOIN_OAUTH2_DEFAULT")),
                    member,
                    null,
                    (guildSettings.language || "english").substr(0, 2),
                    null
                );
                channel.send(formattedMessage);
            } else if (perm){
                channel.send(member.guild.translate("misc:JOIN_PERMISSIONS", {
                    user: member.user.toString()
                }));
            } else {
                const formattedMessage = this.client.functions.formatMessage(
                    (join.unknownMessage || member.guild.translate("misc:JOIN_UNKNOWN_DEFAULT")),
                    member,
                    null,
                    (guildSettings.language || "english").substr(0, 2),
                    null
                );
                channel.send(formattedMessage);
            }
        }
        logMessage += `Time: ${Date.now()-startAt}ms\n`;
        console.log(logMessage + "----------");

    }
};
