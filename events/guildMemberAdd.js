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
                    if(member.user.id === "422820341791064085") console.log("Vanity invite");
                } else if(!inviteUsed){
                    let newAndUsed = guildInvites.filter((i) => !oldGuildInvites.get(i.code) && i.uses === 1);
                    if(newAndUsed.size === 1){
                        inviteUsed = newAndUsed.first();
                        console.log("NewAndUsed invite!");
                    }
                } else {
                    if(member.user.id === "422820341791064085") console.log("Invite used "+inviteUsed.code);
                    if(member.user.id === "422820341791064085") console.log(member.guild.features.includes("VANITY_URL"));
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
                // If the member had previously invited this member and he had left
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
                /* Search for the closest (and highest) fair role to the number of invitations from the member */
                let nextRank = null;
                guildData.ranks.forEach((rank) => {
                    // The role is higher (or equal) than the member's invitations?
                    let superior = (rank.inviteCount >= (inviterData.invites + inviterData.bonus - inviterData.leaves - inviterData.fake));
                    // The role exists?
                    let found = member.guild.roles.get(rank.roleID);
                    // The role is lower than the index role?
                    let superiorFound = (nextRank ? rank.inviteCount < nextRank.inviteCount : true);
                    // If all conditions are correct, the value of the index is changed
                    if(superior && found && superiorFound) nextRank = rank;
                });
                // If a role is found and the member has enough invitation to get it
                if(nextRank && nextRank.inviteCount === (inviterData.invites + inviterData.bonus - inviterData.leaves - inviterData.fake)){
                    // Should we remove the old roles?
                    if(!guildData.stacked){
                        // Search for all roles below the index role to be added
                        let oldRoles = guildData.ranks.filter((r) => r.inviteCount < nextRank.inviteCount);
                        // Filter to keep only existing roles
                        let oldRolesFound = oldRoles.filter((r) => member.guild.roles.get(r.roleID));
                        // The member's roles are removed (! we don't test if the member has the role, no need!)
                        oldRolesFound.forEach((r) => inviterMember.roles.remove(r.roleID));
                    }
                    // Ajout du nouveau rôle
                    inviterMember.roles.add(nextRank.roleID);
                }
                // If the member ever has more invitations than the highest role, the highest role is added
                if(!nextRank){
                    // Search for the highest role
                    let highestRole = guildData.ranks.sort((a,b) => b.inviteCount - a.inviteCount)[0];
                    // If there is a higher role and the member can get it
                    if(highestRole && highestRole.inviteCount < (inviterData.invites + inviterData.bonus - inviterData.leaves - inviterData.fake)){
                        // We're looking for it in the server roles, to see if it really exists
                        let highestRoleFound = member.guild.roles.get(highestRole.roleID);
                        // If it is does exist
                        if(highestRoleFound){
                            // Add the role to the member
                            inviterMember.roles.add(highestRoleFound);
                            // Should we remove the old roles?
                            if(!guildData.stacked){
                                // Search for all roles below the highest role to be added
                                let oldRoles = guildData.ranks.filter((r) => r.inviteCount < highestRole.inviteCount);
                                // Filter to keep only existing roles
                                let oldRolesFound = oldRoles.filter((r) => member.guild.roles.get(r.roleID));
                                // The member's roles are removed (! we don't test if the member has the role, no need!)
                                oldRoles.forEach((r) => inviterMember.roles.remove(r.roleID));
                            }
                        }
                    }
                }
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
            }
        }

    }
}