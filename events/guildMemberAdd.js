const { isEqual } = require("../helpers/functions.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (member) {

        if (!this.client.fetched) return;
        console.log("Calculating for member "+member.id);

        // Fetch guild and member data from the db
        const guildData = await this.client.database.fetchGuild(member.guild.id);
        if (!guildData.premium) return;

        member.guild.data = guildData;
        const memberData = await this.client.database.fetchMember(member.id, member.guild.id);
        
        /* Find who is the inviter */

        let invite = null;
        let vanity = false;
        let oauth = false;
        let perm = false;

        if (!member.guild.me) await member.guild.members.fetch({
            user: this.client.user.id,
            cache: true
        });
        if (!member.guild.me.hasPermission("MANAGE_GUILD")) perm = true;

        if (member.user.bot){
            oauth = true;
        } else if (!perm) {
            // Fetch the current invites of the guild
            const guildInvites = await member.guild.fetchInvites().catch(() => {});
            // Fetch the invites of the guild BEFORE that the member has joined
            const oldGuildInvites = this.client.invitations[member.guild.id];
            if (guildInvites && oldGuildInvites){
                // Update the cache
                this.client.invitations[member.guild.id] = guildInvites;
                // Find the invitations which doesn't have the same number of use
                let inviteUsed = guildInvites.find((i) => oldGuildInvites.get(i.code) && ((Object.prototype.hasOwnProperty.call(oldGuildInvites.get(i.code), "uses") ? oldGuildInvites.get(i.code).uses : "Infinite") < i.uses));
                if ((isEqual(oldGuildInvites.map((i) => `${i.code}|${i.uses}` ).sort(), guildInvites.map((i) => `${i.code}|${i.uses}` ).sort())) && !inviteUsed && member.guild.features.includes("VANITY_URL")){
                    vanity = true;
                } else if (!inviteUsed){
                    const newAndUsed = guildInvites.filter((i) => !oldGuildInvites.get(i.code) && i.uses === 1);
                    if (newAndUsed.size === 1){
                        inviteUsed = newAndUsed.first();
                    }
                }
                if (inviteUsed && !vanity) invite = inviteUsed;
            }
            if (!invite){
                const targetInvite = guildInvites.some((i) => i.targetUser && (i.targetUser.id === member.id));
                if (targetInvite.uses === 1) {
                    invite = targetInvite;
                }
            }
        }


        const inviter = invite ? await this.client.resolveUser(invite.inviter.id) : null;
        const inviterData = inviter ? await this.client.database.fetchMember(inviter.id, member.guild.id) : null;

        if (inviter && guildData.blacklistedUsers.includes(inviter.id)) return;

        // If we know who invited the member
        if (invite){
            // We look for the member in the server members
            const inviterMember = member.guild.members.cache.get(inviter.id) || await member.guild.members.fetch(inviter.id).catch(() => {});
            /* If it does exist
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
                
            }*/

            // If the member had previously invited this member and they have left
            const lastJoinData = inviterData.invitedMemberEvents.filter((j) => j.type === "join" && j.guildID === member.guild.id && j.inviterID === inviterMember.id)[0];
            if (lastJoinData){
                inviterData.leaves--;
                inviterData.fake++;
            }
            
            // or if the member invited himself
            else if (inviter.id === member.id) {
                inviterData.fake++;
            }

            inviterData.regular++;

            if (inviterMember) await this.client.functions.assignRanks(inviterMember, inviterData.calculatedInvites, guildData.ranks, guildData.keepRanks, guildData.stackedRanks);

            await inviterData.updateInvites();
            await this.client.database.createEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "join",
                eventDate: new Date(),
                joinType: "normal",
                inviterID: inviter.id,
                inviteData: {
                    uses: invite.uses,
                    url: invite.url,
                    code: invite.code,
                    inviter: inviter.id
                }
            });
        } else if (oauth){
            await this.client.database.createEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "join",
                eventDate: new Date(),
                joinType: "oauth"
            });
        } else if (vanity){
            await this.client.database.createEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "join",
                eventDate: new Date(),
                joinType: "vanity"
            });
        } else if (perm){
            await this.client.database.createEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "join",
                eventDate: new Date(),
                joinType: "perm"
            });
        } else {
            await this.client.database.createEvent({
                userID: member.id,
                guildID: member.guild.id,
                eventType: "join",
                eventDate: new Date(),
                joinType: "unknown"
            });
        }

        /*if(invite){
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
        }*/

        // DM Join messages
        if (guildData.joinDM.enabled && guildData.joinDM.mainMessage && guildData.premium){
            if (invite){
                const formattedMessage = this.client.functions.formatMessage(guildData.joinDM.mainMessage, member, (guildData.language || "english").substr(0, 2), {
                    inviter,
                    inviterData,
                    invite,
                    numJoins: memberData.numJoins
                });
                member.send(formattedMessage).catch(() => {});
            } else if (vanity){
                const formattedMessage = this.client.functions.formatMessage((guildData.joinDM.vanityMessage || member.guild.translate("misc:JOIN_DM_VANITY_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null);
                member.send(formattedMessage).catch(() => {});
            } else {
                const formattedMessage = this.client.functions.formatMessage((guildData.joinDM.unknownMessage || member.guild.translate("misc:JOIN_DM_UNKNOWN_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null);
                member.send(formattedMessage).catch(() => {});
            }
        }

        // Join messages
        if (guildData.join.enabled && guildData.join.mainMessage && guildData.join.channel){
            const channel = member.guild.channels.cache.get(guildData.join.channel);
            if (!channel) return;
            if (invite){
                const formattedMessage = this.client.functions.formatMessage(guildData.join.mainMessage, member, (guildData.language || "english").substr(0, 2), {
                    inviter,
                    inviterData,
                    invite,
                    numJoins: memberData.numJoins
                });
                channel.send(formattedMessage);
            } else if (vanity){
                const formattedMessage = this.client.functions.formatMessage((guildData.join.vanityMessage || member.guild.translate("misc:JOIN_VANITY_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null);
                channel.send(formattedMessage);
            } else if (oauth){
                const formattedMessage = this.client.functions.formatMessage((guildData.join.oauth2Message || member.guild.translate("misc:JOIN_OAUTH2_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null);
                channel.send(formattedMessage);
            } else if (perm){
                channel.send(member.guild.translate("misc:JOIN_PERMISSIONS", {
                    user: member.user.toString()
                }));
            } else {
                const formattedMessage = this.client.functions.formatMessage((guildData.join.unknownMessage || member.guild.translate("misc:JOIN_UNKNOWN_DEFAULT")), member, (guildData.language || "english").substr(0, 2), null);
                channel.send(formattedMessage);
            }
        }

    }
};