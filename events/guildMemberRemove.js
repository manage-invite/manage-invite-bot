module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (member) {

        // Prevent undefined left the server
        if(!member.user) return;
        if(!this.client.fetched) return;

        // Fetch guild and member data from the db
        const guildData = await this.client.database.fetchGuild(member.guild.id);
        if(!guildData.premium) return;

        member.guild.data = guildData;
        const memberData = await this.client.database.fetchMember(member.id, member.guild.id);
        
        const inviter = memberData.joinData
            && memberData.joinData.joinType === "normal"
            && memberData.joinData.inviteData
            ? await this.client.resolveUser(memberData.joinData.inviterID)
            : null;
        const inviterData = inviter ? await this.client.database.fetchMember(inviter.id, member.guild.id) : null;
        const invite = (memberData.joinData || {}).inviteData;

        // Update member invites
        if(inviter){
            if(guildData.blacklistedUsers.includes(inviter.id)) return;
            const inviterMember = member.guild.members.cache.get(inviter.id) ?? await member.guild.members.fetch({
                user: inviter.id,
                cache: true
            });
            if(inviterMember){
                inviterData.leaves++;
                await this.client.functions.assignRanks(inviterMember, inviterData.calculatedInvites, guildData.ranks, guildData.keepRanks, guildData.stackedRanks);
                await inviterData.updateInvites();
                await this.client.database.createEvent({
                    userID: member.id,
                    guildID: member.guild.id,
                    eventType: "leave",
                    eventDate: new Date()
                });
            }
        }

        // Leave messages
        if(guildData.leave.enabled && guildData.leave.mainMessage && guildData.leave.channel){
            const channel = member.guild.channels.cache.get(guildData.leave.channel);
            if(!channel) return;
            const joinType = memberData.joinData ? memberData.joinData.joinType : null;
            if(invite){
                const formattedMessage = this.client.functions.formatMessage(guildData.leave.mainMessage, member, (guildData.language || "english").substr(0, 2), {
                    inviter,
                    inviterData,
                    invite,
                    numJoins: memberData.numJoins
                });
                channel.send(formattedMessage);
            } else if(joinType === "vanity"){
                const formattedMessage = this.client.functions.formatMessage((guildData.leave.vanityMessage || member.guild.translate("misc:LEAVE_VANITY_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null);
                channel.send(formattedMessage);
            } else if(joinType === "oauth"){
                const formattedMessage = this.client.functions.formatMessage((guildData.leave.oauth2Message || member.guild.translate("misc:LEAVE_OAUTH2_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null);
                channel.send(formattedMessage);
            } else {
                const formattedMessage = this.client.functions.formatMessage((guildData.leave.unknownMessage || member.guild.translate("misc:LEAVE_UNKNOWN_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null);
                channel.send(formattedMessage);
            }
        }

    }
};