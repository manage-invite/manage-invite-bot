const Discord = require("discord.js");

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
        let memberData = await this.client.database.fetchMember(member.id, member.guild.id);
        
        let inviter = memberData.joinData && memberData.joinData.type === "normal" && memberData.joinData.inviteData ? await this.client.resolveUser(memberData.joinData.inviteData.inviter) : typeof memberData.invitedBy === "string" ? await this.client.resolveUser(memberData.invitedBy) : null;
        let inviterData = inviter ? await this.client.database.fetchMember(inviter.id, member.guild.id) : null;
        let invite = (memberData.joinData || {}).inviteData;


        // Update member invites
        if(inviter){
            if(guildData.blacklistedUsers.includes(inviter.id)) return;
            let inviterMember = member.guild.members.cache.get(inviter.id);
            if(inviterMember){
                inviterData.leaves++;
                inviterData.updateInvites();
                inviterData.addInvitedUserLeft(member.id);
                await this.client.functions.assignRanks(inviterMember, inviterData.calculatedInvites, guildData.ranks, guildData.keepRanks, guildData.stackedRanks);
            }
        }

        // Leave messages
        if(guildData.leave.enabled && guildData.leave.mainMessage && guildData.leave.channel){
            let channel = member.guild.channels.cache.get(guildData.leave.channel);
            if(!channel) return;
            let joinType = memberData.joinData ? memberData.joinData.type : null;
            if(invite){
                let formattedMessage = this.client.functions.formatMessage(guildData.leave.mainMessage, member, (guildData.language || "english").substr(0, 2), {
                    inviter,
                    inviterData,
                    invite
                });
                channel.send(formattedMessage);
            } else if(joinType === "vanity"){
                let formattedMessage = this.client.functions.formatMessage((guildData.leave.vanityMessage || member.guild.translate("misc:LEAVE_VANITY_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null)
                channel.send(formattedMessage);
            } else if(joinType === "oauth"){
                let formattedMessage = this.client.functions.formatMessage((guildData.leave.oauth2Message || member.guild.translate("misc:LEAVE_OAUTH2_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null);
                channel.send(formattedMessage);
            } else {
                let formattedMessage = this.client.functions.formatMessage((guildData.leave.unknownMessage || member.guild.translate("misc:LEAVE_UNKNOWN_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null)
                channel.send(formattedMessage);
            }
        }

        // Remove member inviter
        await memberData.clearJoinData();

    }
}