const Discord = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (member) {

        if(!this.client.fetched) return;

        // Fetch guild and member data from the db
        let guildData = await this.client.findOrCreateGuild({ id: member.guild.id });
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: member.guild.id, bot: member.user.bot });
        
        let inviter = memberData.joinData && memberData.joinData.type === "normal" ? await this.client.resolveUser(memberData.joinData.invite.inviter) : typeof memberData.invitedBy === "string" ? await this.client.resolveUser(memberData.invitedBy) : null;
        let inviterData = inviter ? await this.client.findOrCreateGuildMember({ id: inviter.id, guildID: member.guild.id, bot: inviter.bot }) : null;
        let invite = (memberData.joinData || memberData.usedInvite || {}).invite;

        // Update member invites
        if(inviter){
            let inviterMember = member.guild.members.get(inviter.id);
            if(inviterMember){
                inviterData.leaves++;
                inviterData.left.push(member.id);
                await inviterData.save();
                /* Search for the closest (and highest) fair role to the number of invitations from the member */
                let currentRankOrPrevious = null;
                guildData.ranks.forEach((rank) => {
                    // The role is higher (or equal) than the member's invitations?
                    let superior = (rank.inviteCount <= (inviterData.invites + inviterData.bonus - inviterData.leaves - inviterData.fake));
                    // The role exists?
                    let found = member.guild.roles.get(rank.roleID);
                    // The role is lower than the index role?
                    let superiorFound = (currentRankOrPrevious ? rank.inviteCount > currentRankOrPrevious.inviteCount : true);
                    // If all conditions are correct, the value of the index is changed
                    if(superior && found && superiorFound) currentRankOrPrevious = rank;
                });
                // If the role found has a greater number of invitations than the member, then it means that the party member has passed the member below the required invitation quota. It is therefore necessary to remove the role and assign it the role below (or none if there is none).
                if(currentRankOrPrevious && currentRankOrPrevious.inviteCount > (inviterData.invites + inviterData.bonus - inviterData.leaves - inviterData.fake)){
                    // Removal of the role
                    inviterMember.roles.remove(currentRankOrPrevious.roleID);
                    // Search for a potential role to add
                    let currentRankOrPreviousIndex = guildData.ranks.sort((a,b) => b.inviteCount - a.inviteCount).indexOf(currentRankOrPrevious);
                    // Search for the role under the currentRankOrPrevious 
                    let rank = guildData.ranks.sort((a,b) => b.inviteCount - a.inviteCount)[currentRankOrPrevious - 1];
                    // If the role is found, it is added
                    if(rank && message.guild.roles.get(rank.roleID)){
                        inviterMember.roles.add(rank.roleID);
                    }
                }
            }
        }

        // Leave messages
        if(guildData.leave.enabled && guildData.leave.message && guildData.leave.channel){
            let channel = member.guild.channels.get(guildData.leave.channel);
            if(!channel) return;
            let joinType = memberData.joinData ? memberData.joinData.type : null;
            let language = require("../languages/"+guildData.language);
            if(invite){
                let formattedMessage = this.client.functions.formatMessage(guildData.leave.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData)
                channel.send(formattedMessage);
            } else if(joinType === "vanity"){
                channel.send(language.utils.specialMessages.leave.vanity(member.toString()))
            } else if(joinType === "oauth"){
                channel.send(language.utils.specialMessages.leave.oauth2(member.toString()))
            } else if(joinType === "perm"){
                channel.send(language.utils.specialMessages.leave.perm(member.toString()))
            } else {
                channel.send(language.utils.specialMessages.leave.unknown(member.toString()))
            }
        }

        // Remove member inviter
        memberData.invitedBy = null;
        memberData.usedInvite = null;
        memberData.joinData = null;
        await memberData.save();

    }
}