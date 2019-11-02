const Discord = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (member, opt = {}) {

        if(!this.client.fetched) return;

        // Fetch guild and member data from the db
        let guildData = await this.client.findOrCreateGuild({ id: member.guild.id });
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: member.guild.id, bot: member.user.bot  });
        
        /* Find who is the inviter */

        let invite = opt.test ? opt.invite : null;

        if(!opt.test){

            // Fetch the current invites of the guild
            let guildInvites = await member.guild.fetchInvites().catch(() => {});
            if(guildInvites){
                // Fetch the invites of the guild BEFORE that the member has joined
                let oldGuildInvites = this.client.invitations[member.guild.id];
                // Update the cache
                this.client.invitations[member.guild.id] = guildInvites;
                // Find the invitations which doesn't have the same number of use
                let inviteUsed = guildInvites.find((i) => oldGuildInvites.get(i.code) && (oldGuildInvites.get(i.code).uses < i.uses));
                if(inviteUsed) invite = inviteUsed;
            }

        }

        let inviter = invite ? await this.client.resolveUser(invite.inviter.id) : null;
        let inviterData = inviter ? await this.client.findOrCreateGuildMember({ id: inviter.id, guildID: member.guild.id, bot: inviter.bot }) : null;

        // Update member invites
        if(invite && !opt.test){
            let inviterMember = member.guild.members.get(inviter.id);
            if(inviterMember){
                if(inviterData.left.includes(member.id)){
                    inviterData.left = inviterData.left.filter((id) => id !== member.id);
                    inviterData.leaves--;
                }
                if(inviterData.invited.includes(member.id)){
                    inviterData.fake++;
                    inviterData.invites++;
                } else {
                    inviterData.invites++;
                    inviterData.invited.push(member.id);
                }
                let nextRank = null;
                guildData.ranks.forEach((rank) => {
                    let superior = (rank.inviteCount >= (inviterData.invites + inviterData.bonus - inviterData.leaves - inviterData.fake));
                    let found = member.guild.roles.get(rank.roleID);
                    let superiorFound = (nextRank ? rank.inviteCount < nextRank.inviteCount : true);
                    if(superior && found && superiorFound) nextRank = rank;
                });
                if(nextRank && nextRank.inviteCount === (inviterData.invites + inviterData.bonus - inviterData.leaves - inviterData.fake)){
                    if(!guildData.stacked){
                        let oldRoles = guildData.ranks.filter((r) => r.inviteCount < nextRank.inviteCount);
                        let oldRolesFound = oldRoles.filter((r) => member.guild.roles.get(r.roleID));
                        oldRolesFound.forEach((r) => inviterMember.roles.remove(r.roleID));
                        inviterMember.roles.add(member.guild.roles.get(nextRank.roleID));
                    } else {
                        inviterMember.roles.add(member.guild.roles.get(nextRank.roleID));
                    }
                }
                if(!nextRank){
                    let highestRole = guildData.ranks.sort((a,b) => b.inviteCount - a.inviteCount)[0];
                    if(highestRole){
                        let highestRoleFound = member.guild.roles.get(highestRole.roleID);
                        if(highestRole && highestRoleFound){
                            inviterMember.roles.add(highestRoleFound);
                            if(!guildData.stacked){
                                let oldRoles = guildData.ranks.filter((r) => r.inviteCount < highestRole.inviteCount);
                                let oldRolesFound = oldRoles.filter((r) => member.guild.roles.get(r.roleID));
                                oldRoles.forEach((r) => inviterMember.roles.remove(r.roleID));
                            }
                        }
                    }
                }
                await inviterData.save();
            }
        }
        
        // Set member inviter
        if(invite && !opt.test){
            memberData.invitedBy = inviter.id;
            memberData.usedInvite = {
                uses: invite.uses,
                url: invite.url,
                code: invite.code,
                inviter: { id: inviter.id }
            };
            await memberData.save();
        }

        // DM Join messages
        if((!opt.test || opt.type === "dm") && guildData.joinDM.enabled && guildData.joinDM.message && invite && guild.premium){
            let formattedMessage = this.client.functions.formatMessage(guildData.join.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData);
            member.send(formattedMessage);
        }

        // Join messages
        if((!opt.test || opt.type === "simple") && guildData.join.enabled && guildData.join.message && guildData.join.channel){
            let formattedMessage = invite ? this.client.functions.formatMessage(guildData.join.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData) : `I can't figure out how ${member} joined the server.`;
            let channel = member.guild.channels.get(guildData.join.channel);
            if(!channel) return;
            channel.send(formattedMessage);
        }

    }
}