const { Constants } = require("discord.js");
const { Client } = require("veza");

module.exports.load = (discordClient) => {

    let firstConnect = false;

    const node = new Client(`ManageInvite Shard #${discordClient.shard.ids[0]}`, {
        retryTime: 1000
    })
        .on("error", (error, client) =>
            console.error(`[IPC] Error from ${client.name}:`, error))
        .on("disconnect", (client) => 
            console.error(`[IPC] Disconnected from ${client.name}`))
        .on("ready", async (client) => {
            console.log(`[IPC] Ready, connected to: ${client.name}`);
        });

    const connect = () => {
        node.connectTo(discordClient.config.ipcServerPort)
            .then(() => firstConnect = true)
            .catch((error) => {
                if (error.message.includes("ECONNREFUSED")) return;
                else console.log("[IPC] Disconnected!", error);
            });
    };

    // eslint-disable-next-line consistent-return
    node.on("message", async (message) => {
        if (message.data.event === "collectData") {
            // eslint-disable-next-line no-eval
            message.reply(eval(`client.${message.data.data}`));
        }
        if (message.data.event === "verifyGuilds") {
            const verifiedGuilds = [];
            message.data.guildIDs.forEach((guildID) => {
                if (discordClient.guilds.cache.has(guildID)) verifiedGuilds.push(guildID);
            });
            message.reply(verifiedGuilds);
        }
        if (message.data.event === "verifyPermissions") {
            const userID = message.data.userID;
            const permissionName = message.data.permissionName;
            const verified = [];
            await Promise.all(message.data.guildIDs.map(async (guildID) => {
                const guild = discordClient.guilds.cache.get(guildID);
                if (!guild) return;
                const member = await guild.members.fetch(userID).catch(() => {});
                if (!member) return;
                else if (member.hasPermission(permissionName)) verified.push(guildID);
            }));
            message.reply(verified);
        }
        if (message.data.event === "getChannelsOf") {
            const shardID = message.data.shardID;
            if (!discordClient.shard.ids.includes(shardID)) return message.reply([]);
            const guild = discordClient.guilds.cache.get(message.data.guildID);
            if (!guild) return message.reply([]);
            return message.reply(guild.channels.cache.filter((c) => c.type === "text").map((c) => ({ id: c.id, name: c.name })));
        }
        if (message.data.event === "getShardStatus") {
            const status = Object.keys(Constants.Status)[discordClient.ws?.status];
            return message.reply({
                id: discordClient.shard.ids[0],
                status: status.charAt(0).toUpperCase() + status.slice(1, status.length).toLowerCase(),
                ram: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                ping: discordClient.ws?.ping,
                serverCount: discordClient.guilds.cache.size
            });
        }
        if (message.data.event === "fetchUsers") {
            const masterShardID = message.data.shardID;
            const foundUsers = [];
            for (const userID of message.data.userIDs) {
                const user = discordClient.users.cache.get(userID) || (discordClient.shard.ids.includes(masterShardID) ? await discordClient.users.fetch(userID).catch(() => {}) : null);
                if (user) foundUsers.push({
                    id: user.id,
                    username: user.username,
                    avatarURL: user.displayAvatarURL(),
                    discriminator: user.discriminator
                });
            }
            return message.reply(foundUsers);
        }
    });

    setInterval(() => {
        if (!firstConnect) connect();
    }, 1000);

    connect();
};
