const { Status, EmbedBuilder } = require("discord.js");
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
        node.connectTo(discordClient.config.ipcServerPort, discordClient.config.ipcServerHost)
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
                console.log(member);
                console.log(member.hasPermission
                );
                if (!member) return;
                else if (member.permissions.has(Permissions)) verified.push(guildID);
            }));
            message.reply(verified);
        }
        if (message.data.event === "getChannelsOf") {
            const shardID = message.data.shardID;
            if (!discordClient.shard.ids.includes(shardID)) return message.reply([]);
            const guild = discordClient.guilds.cache.get(message.data.guildID);
            if (!guild) return message.reply([]);
            return message.reply(guild.channels.cache.filter((c) => c.type !== "GUILD_VOICE").map((c) => ({ id: c.id, name: c.name })));
        }
        if (message.data.event === "getShardStatus") {
            const status = Object.keys(Status)[discordClient.ws?.status];
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
        if (message.data.event === "paypalNotification") {
            console.log("PayPal notification received!", JSON.stringify(message.data));
            const { premiumLogs } = discordClient.config;
            const aLogs = discordClient.channels.cache.get(premiumLogs);
            if (!aLogs) return console.log(`Shard #${discordClient.shard.ids[0]}: PayPal Notif, channel logs can not be found`);
            const user = await discordClient.users.fetch(message.data.userID).catch(() => {});
            if (!user) return console.log(`Shard #${discordClient.shard.ids[0]}: PayPal Notif, user can not be found ${message.data.userID}`);
            switch (message.data.notificationType) {
            case "verification": {
                const logEmbed = new EmbedBuilder()
                    .setAuthor({
                        name: `${user.tag} purchased ManageInvite Premium`,
                        iconURL: user.displayAvatarURL()
                    })
                    .setDescription(`Server **${message.data.guildName}** is waiting for verification... :clock7:`)
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
                    .setDescription(`Subscription for guild **${message.data.guildName}** created... :white_check_mark:`)
                    .setColor("#ff9966");
                aLogs.send({ embeds: [logEmbed] });
                discordClient.shard.broadcastEval((client, userID) => {
                    if (client.guilds.cache.some((g) => g.roles.cache.has(client.config.premiumRole))){
                        const guild = client.guilds.cache.find((g) => g.roles.cache.has(client.config.premiumRole));
                        guild.members.fetch(userID).then((member) => {
                            member.roles.add(client.config.premiumRole);
                        }).catch(() => {});
                    }
                }, { context: message.data.userID });
                break;
            }
            case "paid": {
                const logEmbed = new EmbedBuilder()
                    .setAuthor({
                        name: `${user.tag} paid for ManageInvite Premium`,
                        iconURL: user.displayAvatarURL()
                    })
                    .setDescription(`Recurring payment for **${message.data.guildName}** was paid (**$2**) :crown:`)
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
                    .setDescription(`Recurring payment for **${message.data.guildName}** was cancelled :wave:\n${formMessage ? "Satisfaction form sent! Awaiting answer... :pencil:" : "I wasn't able to send the satisfaction form... :confused:"}`)
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
                    .setDescription(`Congratulations, your server **${message.data.guildName}** is now premium! :crown:`)
                    .setColor("#ff9966");
                user.send({ embeds: [logEmbed] });
                break;
            }
            }
        }
    });

    setInterval(() => {
        if (!firstConnect) connect();
    }, 1000);

    connect();
};
