const Discord = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (member, opt = {}) {

        if(!this.client.fetched) return;

        // Fetch guild and member data from the db
        let guildData = await this.client.findOrCreateGuild({ id: member.guild.id });
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: member.guild.id, bot: member.user.bot });
        
        let invitedBy = memberData.invitedBy;
        let inviter = invitedBy ? await this.client.resolveUser(invitedBy) : null;
        let inviterData = inviter ? await this.client.findOrCreateGuildMember({ id: inviter.id, guildID: member.guild.id, bot: inviter.bot }) : null;
        let invite = memberData.usedInvite;

        // Update member invites
        if(inviter && !opt.test){
            if(member.guild.members.get(inviter.id)){
                inviterData.leaves++;
                inviterData.left.push(member.id);
                await inviterData.save();
            }
        }
        
        // Remove member inviter
        if(!opt.test){
            memberData.invitedBy = null;
            await memberData.save();
        }

        // Leave messages
        if(guildData.leave.enabled && guildData.leave.message && guildData.leave.channel){
            let formattedMessage = invite ? this.client.functions.formatMessage(guildData.leave.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData) : `${member} left but I can't figure out who invited him.`;
            let channel = member.guild.channels.get(guildData.leave.channel);
            if(!channel) return;
            channel.send(formattedMessage);
        }

    }
}