const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "sync-ranks",
            enabled: true,
            aliases: [ "syncr" ],
            clientPermissions: [ "MANAGE_GUILD" ],
            permLevel: 2
        });
    }

    async run (message, args) {

        if (args[0] === "cancel" && this.client.syncRanksTasks[message.guild.id]){
            this.client.syncRanksTasks[message.guild.id].status = "BEING_CANCELLED";
            return message.success("admin/sync-ranks:CANCELLED");
        }

        if (this.client.syncRanksTasks[message.guild.id] && this.client.syncRanksTasks[message.guild.id].status === "RUNNING") {
            return message.success("admin/sync-ranks:RUNNING", {
                percent: `${Math.round(this.client.syncRanksTasks[message.guild.id].now*100/this.client.syncRanksTasks[message.guild.id].total)}%`,
                prefix: message.guild.settings.prefix
            });
        } else if (this.client.syncRanksTasks[message.guild.id] && this.client.syncRanksTasks[message.guild.id].status === "BEING_CANCELLED"){
            return message.success("admin/sync-ranks:BEING_CANCELLED");
        }

        const [guildRanks, membersData] = await Promise.all([
            this.client.database.fetchGuildRanks(message.guild.id),
            this.client.database.fetchGuildLeaderboard(message.guild.id, message.guild.settings.storageID)
        ]);

        const conf = await message.sendT("admin/sync-ranks:CONFIRM", {
            success: this.client.config.emojis.success,
            error: this.client.config.emojis.error
        });
        await message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
            if (!collected.first()) return;
            if (collected.first().content === "cancel") return conf.error("common:CANCELLED", null, true);
            collected.first().delete().catch(() => {});
            conf.success("admin/sync-ranks:STARTED", {
                prefix: message.guild.settings.prefix
            }, {
                edit: true
            });

            this.client.syncRanksTasks[message.guild.id] = {
                now: 10,
                total: membersData.length,
                status: "RUNNING"
            };

            while (membersData.length > 0 && (this.client.syncRanksTasks[message.guild.id] && this.client.syncRanksTasks[message.guild.id].status === "RUNNING")){
                const memberData = membersData.shift();
                this.client.syncRanksTasks[message.guild.id].now++;
                const member = message.guild.members.cache.get(memberData.userID) || await message.guild.members.fetch(memberData.userID).catch(() => {});
                await this.client.functions.assignRanks(member, memberData.invites, guildRanks, message.guild.settings.keepRanks, message.guild.settings.stackedRanks).catch(() => {});
            }

            if (this.client.syncRanksTasks[message.guild.id] && this.client.syncRanksTasks[message.guild.id].status === "RUNNING"){
                message.success("admin/sync-ranks:SUCCESS");
            }
            delete this.client.syncRanksTasks[message.guild.id];

        }).catch((err) => {
            console.error(err);
            conf.error("common:CANCELLED", null, true);
        });

    }

};
