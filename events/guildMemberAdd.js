const Discord = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (member) {

        if(!this.client.fetched) return;

        // Fetch guild and member data from the db
        let guildData = await this.client.findOrCreateGuild({ id: member.guild.id });
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: member.guild.id, bot: member.user.bot  });
        
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
            if(guildInvites){
                // Fetch the invites of the guild BEFORE that the member has joined
                let oldGuildInvites = this.client.invitations[member.guild.id];
                // Update the cache
                this.client.invitations[member.guild.id] = guildInvites;
                // Find the invitations which doesn't have the same number of use
                let inviteUsed = guildInvites.find((i) => oldGuildInvites.get(i.code) && ((oldGuildInvites.get(i.code).hasOwnProperty("uses") ? oldGuildInvites.get(i.code).uses : "Infinite") < i.uses));
                if((oldGuildInvites.map((i) => `${i.uses}|${i.code}` ).sort() === guildInvites.map((i) => `${i.uses}|${i.code}` ).sort()) && !inviteUsed && member.guild.features.includes("VANITY_URL")){
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
        let inviterData = inviter ? await this.client.findOrCreateGuildMember({ id: inviter.id, guildID: member.guild.id, bot: inviter.bot }) : null;

        // If we know who invited the member
        if(invite){
            // We look for the member in the server members
            let inviterMember = member.guild.members.get(inviter.id);
            // If it does exist
            if(inviterMember){
                // If the member had previously invited this member and they have left
                if(inviterData.left.includes(member.id)){
                    // It is removed from the invited members
                    inviterData.left = inviterData.left.filter((id) => id !== member.id);
                    // We're removing a leave
                    inviterData.leaves--;
                }
                // If the member had already invited this member before
                if(inviterData.invited.includes(member.id)){
                    // We increase the number of fake invitations
                    inviterData.fake++;
                    // We increase the number of regular invitations
                    inviterData.invites++;
                } else {
                    // We increase the number of ordinary invitations
                    inviterData.invites++;
                    // We save that this member invited this member
                    inviterData.invited.push(member.id);
                }
                await this.client.functions.assignRanks(inviterMember, inviterData.calcInvites(), guildData.ranks);
                await inviterData.save();
            }
        }
        
        let language = require("../languages/"+guildData.language);

        if(invite){
            memberData.joinData = {
                type: "normal",
                invite: {
                    uses: invite.uses,
                    url: invite.url,
                    code: invite.code,
                    inviter: inviter.id
                }
            };
        } else if(oauth){
            memberData.joinData = {
                type: "oauth"
            }
        } else if(vanity){
            memberData.joinData = {
                type: "vanity"
            }
        } else if(perm){
            memberData.joinData = {
                type: "perm"
            }
        }
        await memberData.save();

        // DM Join messages
        if(guildData.joinDM.enabled && guildData.joinDM.message && invite && guildData.premium){
            let formattedMessage = this.client.functions.formatMessage(guildData.joinDM.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData);
            member.send(formattedMessage);
        }

        // Join messages
        if(guildData.join.enabled && guildData.join.message && guildData.join.channel){
            let channel = member.guild.channels.get(guildData.join.channel);
            if(!channel) return;
            if(invite){
                let formattedMessage = this.client.functions.formatMessage(guildData.join.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData)
                channel.send(formattedMessage);
            } else if(vanity){
                channel.send(language.utils.specialMessages.join.vanity(member.toString()))
            } else if(oauth){
                channel.send(language.utils.specialMessages.join.oauth2(member.toString()))
            } else if(perm){
                channel.send(language.utils.specialMessages.join.perm(member.toString()))
            } else {
                channel.send(language.utils.specialMessages.join.unknown(member.toString()))
            }
        }

    }
}