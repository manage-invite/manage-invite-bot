const mongoose = require("mongoose");
const config = require("../config");

const fs = require("fs");

let membersCSV = "";
let membersCSVCount = 0;
let membersInvitedUsers = "";
let membersInvitedUsersCount = 0;
let membersInvitedUsersLeft = "";
let membersInvitedUsersLeftCount = 0;
let membersJoinData = "";
let membersJoinDataCount = 0;

let guildsCSV = "";
let guildsCSVCount = 0;
let guildsPlugins = "";
let guildsPluginsCount = 0;
let guildsRanks = "";
let guildsRanksCount = 0;
let guildsBlacklistedUsers = "";
let guildsBlacklistedUsersCount = 0;

(async () => {
    await mongoose.connect(config.mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    const members = require("./GuildMember");
    const guilds = require("./Guild");

    guilds.find().lean().then((guildsData) => {
        console.log(`${guildsData.length} guilds found.`);
        guildsData.forEach((guildData, index) => {
            if(!String(index/1000).includes(".")) console.log("[G] Restoring guild #"+index);
            guildsCSVCount++;
            guildsCSV += `${guildData.id}|${guildData.language}|${guildData.prefix === "|" ? "\n" : guildData.prefix.includes("\n") ? "+" : guildData.pefix}|${guildData.premium || false}\n`;
            guildsPluginsCount++;
            guildData.joinDM.message = guildData.joinDM.message ? guildData.joinDM.message.replace(/'/g, "''") : null;
            guildsPlugins += `${guildData.id}|joinDM|${JSON.stringify(guildData.joinDM)}\n`;
            guildsPluginsCount++;
            guildData.join.message = guildData.join.message ? guildData.join.message.replace(/'/g, "''") : null;
            guildsPlugins += `${guildData.id}|join|${JSON.stringify(guildData.join)}\n`;
            guildsPluginsCount++;
            guildData.leave.message = guildData.leave.message ? guildData.leave.message.replace(/'/g, "''") : null;
            guildsPlugins += `${guildData.id}|leave|${JSON.stringify(guildData.leave)}\n`;
            (guildData.ranks || []).forEach((rank) => {
                if(rank.inviteCount > 9223372036854775808) return;
                guildsRanksCount++;
                guildsRanks += `${guildData.id}|${rank.roleID}|${rank.inviteCount}\n`;
            });
            (guildData.blacklistedUsers || []).forEach((userID) => {
                guildsBlacklistedUsersCount++
                guildsBlacklistedUsers += `${guildData.id}|${userID}\n`;
            });
        });
        console.log(`${guildsCSVCount} guilds saved.`);
        console.log(`${guildsPluginsCount} guild plugins saved.`);
        console.log(`${guildsRanksCount} guild ranks saved.`);
        console.log(`${guildsBlacklistedUsersCount} guild blacklisted users saved.`);
        fs.writeFile("./guildsBlacklistedUsers.csv.txt", guildsBlacklistedUsers, () => {
            fs.writeFile("./guildsRanks.csv.txt", guildsRanks, () => {
                fs.writeFile("./guildsPluginsCount.csv.txt", guildsPlugins, () => {
                    fs.writeFile("./guilds.csv.txt", guildsCSV, () => {});
                });
            });
        });
    });

    members.find().lean().then((membersData) => {
        console.log(`${membersData.length} members found.`);
        membersData.forEach((memberData, index) => {
            if(!String(index/100000).includes(".")) console.log("[M] Restoring member #"+index);
            if(memberData.bonus > 9223372036854775808 || memberData.old_bonus > 9223372036854775808) return;
            membersCSVCount++;
            membersCSV += `${memberData.id}|${memberData.guildID}|${memberData.fake || 0}|${memberData.leaves || 0}|${memberData.bonus || 0}|${memberData.invites || 0}|${memberData.old_fake || 0}|${memberData.old_leaves || 0}|${memberData.old_bonus || 0}|${memberData.old_invites || 0}|${memberData.backuped || false}\n`;
            (memberData.invited || []).forEach((ID) => {
                membersInvitedUsersCount++;
                membersInvitedUsers += `${memberData.id}|${memberData.guildID}|${ID}\n`;
            });
            (memberData.left || []).forEach((ID) => {
                membersInvitedUsersLeftCount++;
                membersInvitedUsersLeft += `${memberData.id}|${memberData.guildID}|${ID}\n`;
            });
            if(memberData.joinData){
                membersJoinDataCount++
                membersJoinData += `${memberData.id}|${memberData.guildID}|${memberData.joinData.type}|${memberData.invitedBy || "\\N"}|${JSON.stringify(memberData.usedInvite) || "\\N"}\n`;
            }
        });
        console.log(`${membersCSVCount} members saved.`);
        console.log(`${membersInvitedUsersCount} members invited users saved.`);
        console.log(`${membersInvitedUsersLeftCount} members invited users left saved.`);
        console.log(`${membersJoinDataCount} members join data saved.`);
        fs.writeFile("./membersJoinData.csv.txt", membersJoinData, () => {
            fs.writeFile("./membersInvitedUsersLeft.csv.txt", membersInvitedUsersLeft, () => {
                fs.writeFile("./membersInvitedUsers.csv.txt", membersInvitedUsers, () => {
                    fs.writeFile("./members.csv.txt", membersCSV, () => {});
                });
            });
        });
    });

})();
