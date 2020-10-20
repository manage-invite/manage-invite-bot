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

    async run (message, args, data) {

        if (args[0] === "cancel" && this.client.syncRanksTasks[message.guild.id]){
            this.client.syncRanksTasks[message.guild.id].status = "BEING_CANCELLED";
            return message.success("admin/sync-ranks:CANCELLED");
        }

        if (this.client.syncRanksTasks[message.guild.id] && this.client.syncRanksTasks[message.guild.id].status === "RUNNING") {
            return message.success("admin/sync-ranks:RUNNING", {
                percent: `${Math.round(this.client.syncRanksTasks[message.guild.id].now*100/this.client.syncRanksTasks[message.guild.id].total)}%`,
                prefix: data.guild.prefix
            });
        } else if (this.client.syncRanksTasks[message.guild.id] && this.client.syncRanksTasks[message.guild.id].status === "BEING_CANCELLED"){
            return message.success("admin/sync-ranks:BEING_CANCELLED");
        }

        const conf = await message.sendT("admin/sync-ranks:CONFIRM", {
            success: this.client.config.emojis.success,
            error: this.client.config.emojis.error
        });
        await message.channel.awaitMessages((m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm"), { max: 1, time: 90000 }).then(async (collected) => {
            if (collected.first().content === "cancel") return conf.error("common:CANCELLED", null, true);
            collected.first().delete().catch(() => {});
            conf.success("admin/sync-ranks:STARTED", {
                prefix: data.guild.prefix
            }, {
                edit: true
            });

            const guild = await message.guild.fetch();
            const members = guild.members.cache.array();

            this.client.syncRanksTasks[message.guild.id] = {
                now: 10,
                total: members.length,
                status: "RUNNING"
            };

            console.time("fetch members");
            await this.client.database.fetchMembers(message.guild.members.cache.map((m) => {
                return {
                    userID: m.id,
                    guildID: message.guild.id
                };
            }));
            console.timeEnd("fetch members");

            console.time("add roles");
            while (members.length > 0 && (this.client.syncRanksTasks[message.guild.id] && this.client.syncRanksTasks[message.guild.id].status === "RUNNING")){
                const member = members.shift();
                this.client.syncRanksTasks[message.guild.id].now++;
                const memberData = await this.client.database.fetchMember(member.id, member.guild.id);
                await this.client.functions.assignRanks(member, memberData.calculatedInvites, data.guild.ranks, data.guild.keepRanks, data.guild.stackedRanks).catch(() => {});
            }
            console.timeEnd("add roles");

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
