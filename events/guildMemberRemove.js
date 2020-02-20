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
        let guildData = await this.client.findOrCreateGuild({ id: member.guild.id });
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: member.guild.id, bot: member.user.bot });
        
        let inviter = memberData.joinData && memberData.joinData.type === "normal" ? await this.client.resolveUser(memberData.joinData.invite.inviter) : typeof memberData.invitedBy === "string" ? await this.client.resolveUser(memberData.invitedBy) : null;
        let inviterData = inviter ? await this.client.findOrCreateGuildMember({ id: inviter.id, guildID: member.guild.id, bot: inviter.bot }) : null;
        let invite = (memberData.joinData || memberData.usedInvite || {}).invite;


        // Update member invites
        if(inviter){
            if(guildData.blacklistedUsers.includes(inviter.id)) return;
            let inviterMember = member.guild.members.cache.get(inviter.id);
            if(inviterMember){
                inviterData.leaves++;
                inviterData.left.push(member.id);
                await inviterData.save();
                await this.client.functions.assignRanks(inviterMember, inviterData.calcInvites(), guildData.ranks);
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