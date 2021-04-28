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
    });

    setInterval(() => {
        if (!firstConnect) connect();
    }, 1000);

    connect();
};
