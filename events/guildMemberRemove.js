module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (member) {

        // Prevent undefined left the server
        if (!member.user) return;
        if (!this.client.fetched) return;

        // Fetch guild and member data from the db
        const guildSubscriptions = await this.client.database.fetchGuildSubscriptions(member.guild.id);
        const isPremium = guildSubscriptions.some((sub) => new Date(sub.expiresAt).getTime() > Date.now());
        if (!isPremium) return;

        const [
            guildSettings,
            guildBlacklistedUsers,
            guildRanks,
            guildPlugins,
            memberEvents
        ] = await Promise.all([
            this.client.database.fetchGuildSettings(member.guild.id),
            this.client.database.fetchGuildBlacklistedUsers(member.guild.id),
            this.client.database.fetchGuildRanks(member.guild.id),
            this.client.database.fetchGuildPlugins(member.guild.id),
            this.client.database.fetchGuildMemberEvents({
                userID: member.id,
                guildID: member.guild.id
            })
        ]);

        const memberData = await this.client.database.fetchGuildMember({
            userID: member.id,
            guildID: member.guild.id,
            storageID: guildSettings.storageID
        });

        const lastJoinData = memberEvents.filter((j) => j.type === "join" && j.guildID === member.guild.id && j.userID === member.id && j.storageID === guildSettings.storageID)[0];

        const inviter = lastJoinData?.joinType === "normal" && lastJoinData.inviteData ? await this.client.resolveUser(lastJoinData.inviterID) : null;

        const inviterData = inviter ? await this.client.database.fetchGuildMember({
            userID: inviter.id,
            guildID: member.guild.id,
            storageID: guildSettings.storageID
        }) : null;
        const invite = lastJoinData?.inviteData;

        // Update member invites
        if (inviter){
            if (guildBlacklistedUsers.includes(inviter.id)) return;
            this.client.database.addInvites({
                userID: inviter.id,
                guildID: member.guild.id,
                storageID: guildSettings.storageID,
                number: 1,
                type: 'leaves'
            });
            if (lastJoinData.joinFake) {
                this.client.database.addInvites({
                    userID: inviter.id,
                    guildID: member.guild.id,
                    storageID: guildSettings.storageID,
                    number: -1,
                    type: 'fake'
                });
            };
            await this.client.database.createEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "leave",
                eventDate: new Date()
            });
            const inviterMember = member.guild.members.cache.get(inviter.id) ?? await member.guild.members.fetch({
                user: inviter.id,
                cache: true
            });
            if (inviterMember){
                await this.client.functions.assignRanks(inviterMember, inviterData.invites, guildRanks, guildSettings.keepRanks, guildSettings.stackedRanks);
            }
        }

        const memberNumJoins = memberEvents.filter((e) => e.type === 'join' && e.userID === member.id).length;
        const leave = guildPlugins.find((p) => p.pluginName === 'leave')?.pluginData;
        // Leave messages
        if (leave.enabled && leave.mainMessage && leave.channel){
            const channel = member.guild.channels.cache.get(leave.channel);
            if (!channel) return;
            const joinType = lastJoinData?.type;
            if (invite){
                const formattedMessage = this.client.functions.formatMessage(
                    leave.mainMessage,
                    member,
                    memberNumJoins,
                    (guildData.language || "english").substr(0, 2),
                    {
                        inviter,
                        inviterData,
                        invite
                    }
                );
                channel.send(formattedMessage);
            } else if (joinType === "vanity"){
                const formattedMessage = this.client.functions.formatMessage((leave.vanityMessage || member.guild.translate("misc:LEAVE_VANITY_DEFAULT")), member, (guildSettings.language || "english").substr(0, 2), null);
                channel.send(formattedMessage);
            } else if (joinType === "oauth"){
                const formattedMessage = this.client.functions.formatMessage((leave.oauth2Message || member.guild.translate("misc:LEAVE_OAUTH2_DEFAULT")), member, (guildSettings.language || "english").substr(0, 2), null);
                channel.send(formattedMessage);
            } else {
                const formattedMessage = this.client.functions.formatMessage((leave.unknownMessage || member.guild.translate("misc:LEAVE_UNKNOWN_DEFAULT")), member, (guildSettings.language || "english").substr(0, 2), null);
                channel.send(formattedMessage);
            }
        }

    }
};