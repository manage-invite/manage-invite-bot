const express = require("express"),
    CheckAuth = require("../auth/CheckAuth"),
    fetch = require("node-fetch"),
    router = express.Router(),
    Discord = require("discord.js");

let notSentSignup = [];

router.get("/", CheckAuth, async (_req, res) => {
    res.redirect("/selector");
});

router.get("/callback", async (req, res) => {

    // Mark the guild as waiting for verification
    const parsedCM = (req.query.cm || "").split(",");
    parsedCM.shift();
    const guildID = parsedCM[0];
    const userID = parsedCM[1];
    const guildName = parsedCM[2];
    if (!guildID) return res.redirect("/");
    req.client.waitingForVerification.push(guildID);
    res.redirect("/selector");

    req.client.users.fetch(userID).then((user) => {
        const logEmbed = escape(JSON.stringify(new Discord.MessageEmbed()
            .setAuthor(`${user.tag} purchased ManageInvite Premium`, user.displayAvatarURL())
            .setDescription(`Server **${guildName}** is waiting for verification... :clock7:`)
            .setColor("#ff9966")));
        const { premiumLogs } = req.client.config;
        req.client.shard.broadcastEval(`
            let aLogs = this.channels.cache.get('${premiumLogs}');
            if(aLogs) aLogs.send({ embed: JSON.parse(unescape('${logEmbed}'))});
        `);
    });
});

router.post("/ipn", async (req, res) => {
    const payload = req.body;
    res.sendStatus(200);
    const payloadCopy = new URLSearchParams(payload);
    payloadCopy.set("cmd", "_notify-validate");
    payloadCopy.set("custom", unescape(payload.custom));
    fetch(req.client.config.paypal.mode === "live" ? req.client.config.paypal.live.fetchURL : req.client.config.paypal.sandbox.fetchURL, {
        method: "POST",
        body: payloadCopy.toString()
    }).then(async (paypalRes) => {
        const valid = await paypalRes.text() === "VERIFIED";
        console.log(payload, valid);
        if (!valid) return console.log("Invalid payment");
        if (payload.txn_type === "subscr_signup"){
            if (
                (payload.mc_amount3 !== "2.00") ||
                (payload.receiver_email !== (req.client.config.paypal.mode === "live" ? req.client.config.paypal.live.email : req.client.config.paypal.sandbox.email))
            ) return;
            const paymentData = (payload.custom || "").split(",");
            paymentData.shift();
            if (!paymentData[0]) return;
            const guildID = paymentData[0];
            const userID = paymentData[1];
            const guildName = paymentData[2];
            notSentSignup.push({
                guildID,
                userID,
                guildName,
                payload
            });
            req.client.users.fetch(userID).then((user) => {
                const logEmbed = escape(JSON.stringify(new Discord.MessageEmbed()
                    .setAuthor(`${user.tag} created a subscription`, user.displayAvatarURL())
                    .setDescription(`Subscription for guild **${guildName}** created... ${req.client.config.emojis.success}`)
                    .setColor("#339900")));
                const { premiumLogs } = req.client.config;
                req.client.shard.broadcastEval(`
                    let aLogs = this.channels.cache.get('${premiumLogs}');
                    if(aLogs) aLogs.send({ embed: JSON.parse(unescape('${logEmbed}'))});
                `);
                req.client.shard.broadcastEval(`
                    if(this.guilds.cache.some((g) => g.roles.cache.has(this.config.premiumRole))){
                        const guild = this.guilds.cache.find((g) => g.roles.cache.has(this.config.premiumRole));
                        guild.members.fetch('${user.id}').then((member) => {
                            member.roles.add(this.config.premiumRole);
                        }).catch(() => {});
                    }
                `);
            });
        }
        if (payload.txn_type === "subscr_payment") {
            console.log(payload);
            if (
                (payload.mc_gross !== "2.00") ||
                (payload.receiver_email !== (req.client.config.paypal.mode === "live" ? req.client.config.paypal.live.email : req.client.config.paypal.sandbox.email))
            ) return;
            const paymentData = (payload.custom || "").split(",");
            paymentData.shift();
            const guildID = paymentData[0];
            const userID = paymentData[1];
            const guildName = paymentData[2];
            const guild = await req.client.database.fetchGuild(guildID);
            req.client.users.fetch(userID).then(async (user) => {
                const signupData = notSentSignup.find((s) => s.guildID === guildID);
                if (signupData) {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(`Thanks for purchasing ManageInvite Premium, ${user.tag}`, user.displayAvatarURL())
                        .setDescription(`Congratulations, your server **${guildName}** is now premium! :crown:`)
                        .setColor("#F4831B");
                    user.send(embed);
                    notSentSignup = notSentSignup.filter((s) => s.guildID !== guildID);
                    const signupID = await req.client.database.createPayment({
                        payerDiscordID: paymentData[1],
                        payerDiscordUsername: user.tag,
                        payerEmail: signupData.payload.payer_email,
                        transactionID: signupData.payload.txn_id,
                        amount: parseInt(signupData.payload.mc_amount3),
                        createdAt: new Date(signupData.payload.subscr_date),
                        type: "paypal_dash_signup_month",
                        details: signupData.payload
                    });
                    const paymentID = await req.client.database.createPayment({
                        payerDiscordID: paymentData[1],
                        payerDiscordUsername: user.tag,
                        payerEmail: payload.payer_email,
                        transactionID: payload.txn_id,
                        amount: parseInt(payload.mc_gross),
                        createdAt: new Date(payload.payment_date),
                        type: "paypal_dash_pmnt_month",
                        details: payload,
                        signupID
                    });
                    const subscription = await req.client.database.createSubscription({
                        expiresAt: new Date(Date.now()+30*24*60*60*1000),
                        createdAt: new Date(payload.payment_date),
                        subLabel: "Premium Monthly 1 Guild",
                        guildsCount: 1
                    });
                    await req.client.database.createSubPaymentLink(subscription.id, signupID);
                    await req.client.database.createSubPaymentLink(subscription.id, paymentID);
                    await req.client.database.createGuildSubLink(guildID, subscription.id);
                    await subscription.deleteGuildsFromCache();
                    await req.client.database.syncSubscriptionForOtherCaches(subscription.id);
                } else {
                    const paymentID = await req.client.database.createPayment({
                        payerDiscordID: paymentData[1],
                        payerDiscordUsername: user.tag,
                        payerEmail: payload.payer_email,
                        transactionID: payload.txn_id,
                        amount: parseInt(payload.mc_gross),
                        createdAt: new Date(payload.payment_date),
                        type: "paypal_dash_pmnt_month",
                        details: payload
                    });
                    let currentSubscription = guild.subscriptions.find((sub) => sub.label === "Premium Monthly 1 Guild");
                    if (!currentSubscription){
                        currentSubscription = await req.client.database.createSubscription({
                            expiresAt: new Date(Date.now()+30*24*60*60*1000),
                            createdAt: new Date(payload.payment_date),
                            subLabel: "Premium Monthly 1 Guild",
                            guildsCount: 1
                        });
                        await req.client.database.createGuildSubLink(guildID, currentSubscription.id);
                    }
                    await req.client.database.createSubPaymentLink(currentSubscription.id, paymentID);
                    await currentSubscription.addDays(30);
                    await currentSubscription.deleteGuildsFromCache();
                    await req.client.database.syncSubscriptionForOtherCaches(currentSubscription.id);
                    req.client.functions.syncPremiumRoles(req.client);
                }
                const logEmbed = escape(JSON.stringify(new Discord.MessageEmbed()
                    .setAuthor(`${user.tag} paid for ManageInvite Premium`, user.displayAvatarURL())
                    .setDescription(`Recurring payment for **${paymentData[2]}** was paid (**$2**) :crown:`)
                    .setColor("#F4831B")));
                const { premiumLogs } = req.client.config;
                req.client.shard.broadcastEval(`
                    let aLogs = this.channels.cache.get('${premiumLogs}');
                    if(aLogs) aLogs.send({ embed: JSON.parse(unescape('${logEmbed}')) });
                `);
            });
        }
        if (payload.txn_type === "subscr_cancel"){
            const paymentData = (payload.custom || "").split(",");
            paymentData.shift();
            const guildID = paymentData[0];
            const userID = paymentData[1];
            const guildName = paymentData[2];
            req.client.users.fetch(userID).then(async (user) => {
                const formContent = `Hello, **${user.username}**\r\nWe're sorry to see you go! Could you tell us why you have cancelled your subscription, so that we can try to improve it? :smiley: \r\n\r\nI cancelled my subscription for the following reason: \r\n\r\n:one: I no longer use ManageInvite for my server\r\n:two: I don't want to pay $2 anymore, it's too big a budget for what ManageInvite offers\r\n:three: I found a better bot\r\n:four: Other\r\n** **`;
                const formMessage = await user.send(formContent).catch(() => {});
                if (formMessage){
                    formMessage.react("\u0031\u20E3");
                    formMessage.react("\u0032\u20E3");
                    formMessage.react("\u0033\u20E3");
                    formMessage.react("\u0034\u20E3");
                }
                const logEmbed = escape(JSON.stringify(new Discord.MessageEmbed()
                    .setAuthor(`${user.tag} cancelled their subscription for ManageInvite Premium`, user.displayAvatarURL())
                    .setDescription(`Recurring payment for **${guildName}** was cancelled :wave:\n${formMessage ? "Satisfaction form sent! Awaiting answer... :pencil:" : "I wasn't able to send the satisfaction form... :confused:"}`)
                    .setFooter(`Form ID: ${formMessage.id}`)
                    .setColor("#1E90FF")));

                req.client.shard.broadcastEval(`
                    let aLogs = this.channels.cache.get(this.config.premiumLogs);
                    if(aLogs) aLogs.send({ embed: JSON.parse(unescape('${logEmbed}'))});
                `);
                const paymentID = await req.client.database.createPayment({
                    payerDiscordID: paymentData[1],
                    payerDiscordUsername: user.tag,
                    payerEmail: payload.payer_email,
                    transactionID: payload.txn_id,
                    amount: 0,
                    createdAt: new Date(payload.subscr_date),
                    type: "paypal_dash_cancel_month",
                    details: payload
                });
                const guild = await req.client.database.fetchGuild(guildID);
                await req.client.database.createSubPaymentLink(guild.subscriptions.find((sub) => sub.label === "Premium Monthly 1 Guild").id, paymentID);
            });
        }
    });
});

module.exports = router;
