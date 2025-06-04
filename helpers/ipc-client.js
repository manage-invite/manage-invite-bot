const { Status, EmbedBuilder } = require("discord.js");
const io = require("socket.io-client");

module.exports.load = (discordClient) => {
    const node = io(`http://${discordClient.config.ipcServerHost}:${discordClient.config.ipcServerPort}`, {
        reconnectionDelay: 1000,
        query: {
            shardID: discordClient.shard.ids[0]
        }
    });

    node.on("error", (error) =>
        console.error("[IPC] Error:", error));

    node.on("disconnect", () =>
        console.error("[IPC] Disconnected from server"));

    node.on("connect", () => {
        console.log("[IPC] Ready, connected to server");
    });

    node.on("collectData", async (data) => {
        try {
            // eslint-disable-next-line no-eval
            const result = eval(`discordClient.${data.data}`);
            node.emit("collectDataResponse", { result });
        } catch (error) {
            node.emit("collectDataResponse", { error: error.message });
        }
    });

    node.on("verifyGuilds", async (data) => {
        const verifiedGuilds = [];
        data.guildIDs.forEach((guildID) => {
            if (discordClient.guilds.cache.has(guildID)) verifiedGuilds.push(guildID);
        });
        node.emit("verifyGuildsResponse", verifiedGuilds);
    });

    node.on("verifyPermissions", async (data) => {
        console.log(data);
        const userID = data.userID;
        const permissionName = data.permissionName;
        const verified = [];
        await Promise.all(data.guildIDs.map(async (guildID) => {
            const guild = discordClient.guilds.cache.get(guildID);
            if (!guild) return;
            const member = await guild.members.fetch(userID).catch(() => {});
            if (!member) return undefined;
            else if (member.permissions.has(permissionName)) verified.push(guildID);
        }));
        node.emit("verifyPermissionsResponse", verified);
    });

    node.on("getChannelsOf", async (data) => {
        const shardID = data.shardID;
        if (!discordClient.shard.ids.includes(shardID)) {
            node.emit("getChannelsOfResponse", []);
            return;
        }
        const guild = discordClient.guilds.cache.get(data.guildID);
        if (!guild) {
            node.emit("getChannelsOfResponse", []);
            return;
        }
        node.emit("getChannelsOfResponse", guild.channels.cache.filter((c) => c.type !== "GUILD_VOICE").map((c) => ({ id: c.id, name: c.name })));
    });

    node.on("getShardStatus", async () => {
        const status = Object.keys(Status)[discordClient.ws?.status];
        node.emit("getShardStatusResponse", {
            id: discordClient.shard.ids[0],
            status: status.charAt(0).toUpperCase() + status.slice(1, status.length).toLowerCase(),
            ram: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            ping: discordClient.ws?.ping,
            serverCount: discordClient.guilds.cache.size
        });
    });

    node.on("fetchUsers", async (data) => {
        const masterShardID = data.shardID;
        const foundUsers = [];
        for (const userID of data.userIDs) {
            const user = discordClient.users.cache.get(userID) || (discordClient.shard.ids.includes(masterShardID) ? await discordClient.users.fetch(userID).catch(() => {}) : null);
            if (user) foundUsers.push({
                id: user.id,
                username: user.username,
                avatarURL: user.displayAvatarURL(),
                discriminator: user.discriminator
            });
        }
        node.emit("fetchUsersResponse", foundUsers);
    });

    node.on("paypalNotification", async (data) => {
        console.log("PayPal notification received!", JSON.stringify(data));
        const { premiumLogs } = discordClient.config;
        const aLogs = discordClient.channels.cache.get(premiumLogs);
        if (!aLogs) return console.log(`Shard #${discordClient.shard.ids[0]}: PayPal Notif, channel logs can not be found`);
        const user = await discordClient.users.fetch(data.userID).catch(() => {});
        if (!user) return console.log(`Shard #${discordClient.shard.ids[0]}: PayPal Notif, user can not be found ${data.userID}`);
        switch (data.notificationType) {
        case "verification": {
            const logEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `${user.tag} purchased ManageInvite Premium`,
                    iconURL: user.displayAvatarURL()
                })
                .setDescription(`Server **${data.guildName}** is waiting for verification... :clock7:`)
                .setColor("#ff9966");
            aLogs.send({ embeds: [logEmbed] });
            break;
        }
        case "subscribed": {
            const logEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `${user.tag} created a subscription`,
                    iconURL: user.displayAvatarURL()
                })
                .setDescription(`Subscription for guild **${data.guildName}** created... :white_check_mark:`)
                .setColor("#ff9966");
            aLogs.send({ embeds: [logEmbed] });
            discordClient.shard.broadcastEval((client, userID) => {
                if (client.guilds.cache.some((g) => g.roles.cache.has(client.config.premiumRole))){
                    const guild = client.guilds.cache.find((g) => g.roles.cache.has(client.config.premiumRole));
                    guild.members.fetch(userID).then((member) => {
                        member.roles.add(client.config.premiumRole);
                    }).catch(() => {});
                }
            }, { context: data.userID });
            break;
        }
        case "paid": {
            const logEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `${user.tag} paid for ManageInvite Premium`,
                    iconURL: user.displayAvatarURL()
                })
                .setDescription(`Recurring payment for **${data.guildName}** was paid (**$2**) :crown:`)
                .setColor("#ff9966");
            aLogs.send({ embeds: [logEmbed] });
            break;
        }
        case "cancelled": {
            const formContent = `Hello, **${user.username}**\r\nWe're sorry to see you go! Could you tell us why you have cancelled your subscription, so that we can try to improve it? :smiley: \r\n\r\nI cancelled my subscription for the following reason: \r\n\r\n:one: I no longer use ManageInvite for my server\r\n:two: I don't want to pay $2 anymore, it's too big a budget for what ManageInvite offers\r\n:three: I found a better bot\r\n:four: Other\r\n** **`;
            const formMessage = await user.send(formContent).catch(() => {});
            if (formMessage){
                formMessage.react("\u0031\u20E3");
                formMessage.react("\u0032\u20E3");
                formMessage.react("\u0033\u20E3");
                formMessage.react("\u0034\u20E3");
            }
            const logEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `${user.tag} cancelled their subscription for ManageInvite Premium`,
                    iconURL: user.displayAvatarURL()
                })
                .setDescription(`Recurring payment for **${data.guildName}** was cancelled :wave:\n${formMessage ? "Satisfaction form sent! Awaiting answer... :pencil:" : "I wasn't able to send the satisfaction form... :confused:"}`)
                .setFooter({
                    text: `Form ID: ${formMessage ? formMessage.id : "not sent"}`
                })
                .setColor("#1E90FF");
            aLogs.send({ embeds: [logEmbed] });
            break;
        }
        case "dms": {
            const logEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `Thanks for purchasing ManageInvite Premium, ${user.tag}`,
                    iconURL: user.displayAvatarURL()
                })
                .setDescription(`Congratulations, your server **${data.guildName}** is now premium! :crown:`)
                .setColor("#ff9966");
            user.send({ embeds: [logEmbed] });
            break;
        }
        }
    });
};
