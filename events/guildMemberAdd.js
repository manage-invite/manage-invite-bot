const Discord = require("discord.js");
const { isEqual } = require('../helpers/functions.js');

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (member) {

        if(!this.client.fetched) return;
        console.log("Calculating for member "+member.id);

        // Fetch guild and member data from the db
        let guildData = await this.client.database.fetchGuild(member.guild.id);
        let memberData = await this.client.database.fetchMember(member.id, member.guild.id);
        
        /* Find who is the inviter */

        let invite = null;
        let vanity = false;
        let oauth = false;
        let perm = false;

        if(!member.guild.me.hasPermission("MANAGE_GUILD")) perm = true;

        if(member.user.bot){
            oauth = true;
        } else if(!perm) {
            // Fetch the current invites of the guild
            let guildInvites = await member.guild.fetchInvites().catch(() => {});
            // Fetch the invites of the guild BEFORE that the member has joined
            let oldGuildInvites = this.client.invitations[member.guild.id];
            if(guildInvites && oldGuildInvites){
                // Update the cache
                this.client.invitations[member.guild.id] = guildInvites;
                // Find the invitations which doesn't have the same number of use
                let inviteUsed = guildInvites.find((i) => oldGuildInvites.get(i.code) && ((oldGuildInvites.get(i.code).hasOwnProperty("uses") ? oldGuildInvites.get(i.code).uses : "Infinite") < i.uses));
                if((isEqual(oldGuildInvites.map((i) => `${i.code}|${i.uses}` ).sort(), guildInvites.map((i) => `${i.code}|${i.uses}` ).sort())) && !inviteUsed && member.guild.features.includes("VANITY_URL")){
                    vanity = true;
                } else if(!inviteUsed){
                    let newAndUsed = guildInvites.filter((i) => !oldGuildInvites.get(i.code) && i.uses === 1);
                    if(newAndUsed.size === 1){
                        inviteUsed = newAndUsed.first();
                    }
                } else {
                }
                if(inviteUsed && !vanity) invite = inviteUsed;
            }
        }


        let inviter = invite ? await this.client.resolveUser(invite.inviter.id) : null;
        let inviterData = inviter ? await this.client.database.fetchMember(inviter.id, member.guild.id) : null;

        if(inviter && guildData.blacklistedUsers.includes(inviter.id)) return;

        // If we know who invited the member
        if(invite){
            // We look for the member in the server members
            let inviterMember = member.guild.members.cache.get(inviter.id);
            // If it does exist
            if(inviterMember){
                // If the member had previously invited this member and they have left
                if(inviterData.invitedUsersLeft.includes(member.id)){
                    // It is removed from the invited members
                    inviterData.removeInvitedUserLeft(member.id);
                    // We're removing a leave
                    inviterData.leaves--;
                }
                // If the member had already invited this member before
                if(inviterData.invitedUsers.includes(member.id)){
                    // We increase the number of fake invitations
                    inviterData.fake++;
                    // We increase the number of regular invitations
                    inviterData.regular++;
                } else {
                    // We increase the number of ordinary invitations
                    inviterData.regular++;
                    // We save that this member invited this member
                    inviterData.addInvitedUser(member.id);
                    if(inviter.id === member.id) inviterData.fake++;
                }
                await inviterData.updateInvites();
                await this.client.functions.assignRanks(inviterMember, inviterData.calcInvites(), guildData.ranks, guildData.keepRanks);
            }
        }

        let language = require("../languages/"+guildData.language);

        if(invite){
            await memberData.setJoinData({
                type: "normal",
                inviterID: inviter.id,
                inviteData: {
                    uses: invite.uses,
                    url: invite.url,
                    code: invite.code,
                    inviter: inviter.id
                }
            });
        } else if(oauth){
            await memberData.setJoinData({
                type: "oauth"
            });
        } else if(vanity){
            await memberData.setJoinData({
                type: "vanity"
            });
        }

        // DM Join messages
        if(guildData.joinDM.enabled && guildData.joinDM.message && invite && guildData.premium){
            let formattedMessage = this.client.functions.formatMessage(guildData.joinDM.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData);
            member.send(formattedMessage);
        }

        // Join messages
        if(guildData.join.enabled && guildData.join.message && guildData.join.channel){
            let channel = member.guild.channels.cache.get(guildData.join.channel);
            if(!channel) return;
            if(invite){
                let formattedMessage = this.client.functions.formatMessage(guildData.join.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData)
                channel.send(formattedMessage);
            } else if(vanity){
                channel.send(language.utils.specialMessages.join.vanity(member.user));
            } else if(oauth){
                channel.send(language.utils.specialMessages.join.oauth2(member.user));
            } else if(perm){
                channel.send(language.utils.specialMessages.join.perm(member.user));
            } else {
                channel.send(language.utils.specialMessages.join.unknown(member.user));
            }
        }

    }
}