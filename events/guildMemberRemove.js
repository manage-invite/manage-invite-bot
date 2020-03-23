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
                await this.client.functions.assignRanks(inviterMember, inviterData.calcInvites(), guildData.ranks, guildData.keepRanks);
            }
        }

        // Leave messages
        if(guildData.leave.enabled && guildData.leave.message && guildData.leave.channel){
            let channel = member.guild.channels.cache.get(guildData.leave.channel);
            if(!channel) return;
            let joinType = memberData.joinData ? memberData.joinData.type : null;
            let language = require("../languages/"+guildData.language);
            if(invite){
                let formattedMessage = this.client.functions.formatMessage(guildData.leave.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData)
                channel.send(formattedMessage);
            } else if(joinType === "vanity"){
                channel.send(language.utils.specialMessages.leave.vanity(member.user));
            } else if(joinType === "oauth"){
                channel.send(language.utils.specialMessages.leave.oauth2(member.user));
            } else if(joinType === "perm"){
                channel.send(language.utils.specialMessages.leave.perm(member.user));
            } else {
                channel.send(language.utils.specialMessages.leave.unknown(member.user));
            }
        }

        // Remove member inviter
        await memberData.clearJoinData();

    }
}