const { isEqual } = require("../helpers/functions.js");

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

        const guildSubscriptions = await this.client.database.fetchGuildSubscriptions(member.guild.id);
        const isPremium = guildSubscriptions.some((sub) => new Date(sub.expiresAt).getTime() > Date.now());
        if (!isPremium) return;

        // Fetch guild and member data from the db
        const [
            guildSettings,
            guildBlacklistedUsers,
            guildRanks,
            guildPlugins
        ] = await Promise.all([
            this.client.database.fetchGuildSettings(member.guild.id),
            this.client.database.fetchGuildBlacklistedUsers(member.guild.id),
            this.client.database.fetchGuildRanks(member.guild.id),
            this.client.database.fetchGuildPlugins(member.guild.id)
        ]);

        member.guild.settings = guildSettings;
        
        /* Find who is the inviter */

        let invite = null;
        let vanity = false;
        let oauth = false;
        let perm = false;

        if (!member.guild.me) await member.guild.members.fetch({
            user: this.client.user.id,
            cache: true
        }).catch(() => {});
        if (!member.guild.me.hasPermission("MANAGE_GUILD")) perm = true;

        if (member.user.bot){
            oauth = true;
        } else if (!perm) {
            // Fetch the current invites of the guild
            const guildInvites = await member.guild.fetchInvites().catch(() => {});
            // Fetch the invites of the guild BEFORE that the member has joined
            const oldGuildInvites = this.client.invitations[member.guild.id];
            if (guildInvites && oldGuildInvites){
                // Update the cache
                this.client.invitations[member.guild.id] = guildInvites;
                // Find the invitations which doesn't have the same number of use
                let inviteUsed = guildInvites.find((i) => oldGuildInvites.get(i.code) && ((Object.prototype.hasOwnProperty.call(oldGuildInvites.get(i.code), "uses") ? oldGuildInvites.get(i.code).uses : "Infinite") < i.uses));
                if ((isEqual(oldGuildInvites.map((i) => `${i.code}|${i.uses}` ).sort(), guildInvites.map((i) => `${i.code}|${i.uses}` ).sort())) && !inviteUsed && member.guild.features.includes("VANITY_URL")){
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

        const inviter = invite && invite.inviter ? await this.client.resolveUser(invite.inviter.id) : null;
        const inviterData = inviter ? await this.client.database.fetchGuildMember({
            userID: inviter.id,
            guildID: member.guild.id,
            storageID: guildSettings.storageID
        }) : null;

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

        if (inviter && guildBlacklistedUsers.includes(inviter.id)) {
            logMessage += "Blacklisted: true\n----------";
            console.log(logMessage);
            return;
        }

        // If we know who invited the member
        if (invite){

            if (inviterData.notCreated) await this.client.database.createGuildMember({
                userID: inviter.id,
                guildID: member.guild.id,
                storageID: guildSettings.storageID
            });

            // We look for the member in the server members
            const inviterMember = member.guild.members.cache.get(inviter.id) || await member.guild.members.fetch(inviter.id).catch(() => {});

            let joinFake = false;

            // If the member had previously invited this member and they have left
            const lastJoinData = inviterEvents.filter((j) => j.eventType === "join" && j.guildID === member.guild.id && j.inviterID === inviterMember.id && j.storageID === guildSettings.storageID)[0];
            if (lastJoinData){
                this.client.database.addInvites({
                    userID: inviter.id,
                    guildID: member.guild.id,
                    storageID: guildSettings.storageID,
                    number: -1,
                    type: "leaves"
                });
                inviterData.leaves--;
                this.client.database.addInvites({
                    userID: inviter.id,
                    guildID: member.guild.id,
                    storageID: guildSettings.storageID,
                    number: 1,
                    type: "fake"
                });
                inviterData.fake++;
            } else if (inviter.id === member.id) {
                this.client.database.addInvites({
                    userID: inviter.id,
                    guildID: member.guild.id,
                    storageID: guildSettings.storageID,
                    number: 1,
                    type: "fake"
                });
                inviterData.fake++;
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

            if (inviterMember) await this.client.functions.assignRanks(inviterMember, inviterData.invites, guildRanks, guildSettings.keepRanks, guildSettings.stackedRanks);

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

        const memberNumJoins = memberEvents.filter((e) => e.eventType === "join" && e.userID === member.id).length;
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