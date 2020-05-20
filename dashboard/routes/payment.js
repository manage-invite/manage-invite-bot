const express = require("express"),
CheckAuth = require("../auth/CheckAuth"),
fetch = require("node-fetch"),
router = express.Router(),
utils = require("../utils"),
Discord = require("discord.js");

router.get("/", CheckAuth, async (_req, res) => {
    res.redirect("/selector");
});

router.get("/callback", async (req, res) => {
    const parsedCM = (req.query.cm || "").split(",");
    parsedCM.shift();
    const guildID = parsedCM[0];
    if(!guildID) return res.redirect("/");
    req.client.waitingForVerification.push(guildID);
    res.redirect("/selector");
});

router.post("/ipn", async (req, res) => {
    const payload = req.body;
    res.sendStatus(200);
    const payloadCopy = new URLSearchParams(payload);
    payloadCopy.set("cmd", "_notify-validate");
    fetch(req.client.config.paypal.mode === "live" ? req.client.config.paypal.live.fetchURL : req.client.config.paypal.sandbox.fetchURL, {
        method: "POST",
        body: payloadCopy.toString()
    }).then(async (paypalRes) => {
        const valid = await paypalRes.text() === "VERIFIED";
        console.log(payload, valid);
        if(!valid) return console.log("Invalid payment");
        if(payload.txn_type === "subscr_signup"){
            if(
                (payload.amount3 !== '2.00' && payload.mc_gross !== '2.00') ||
                (payload.receiver_email !== (req.client.config.paypal.mode === "live" ? req.client.config.paypal.live.email : req.client.config.paypal.sandbox.email))
            ) return;
            const paymentData = (payload.custom || "").split(",");
            paymentData.shift();
            if(!paymentData[0]) return;
            const guildID = paymentData[0];
            const userID = paymentData[1];
            const guildName = paymentData[2];
            const guild = await req.client.database.fetchGuild(guildID);
            await guild.addPremiumDays(30, "sub_dash_paypal", paymentData[1]);
            await guild.setTrialPeriodEnabled(false);
            req.client.users.fetch(userID).then((user) => {
                const embed = new Discord.MessageEmbed()
                .setAuthor(`Thanks for purchasing ManageInvite Premium, ${user.tag}`, user.displayAvatarURL())
                .setDescription(`Congratulations, your server **${guildName}** is now premium! :crown:`)
                .setColor("#F4831B");
                user.send(embed);
                const logEmbed = JSON.stringify(new Discord.MessageEmbed()
                .setAuthor(`${user.tag} purchased ManageInvite Premium`, user.displayAvatarURL())
                .setDescription(`Server **${guildName}** is now premium (**$2/month**) :crown:`)
                .setColor("#F4831B")).replace(/[\/\(\)\']/g, "\\$&");
                let { premiumLogs } = req.client.config;
                req.client.shard.broadcastEval(`
                    let aLogs = this.channels.cache.get('${premiumLogs}');
                    if(aLogs) aLogs.send({ embed: JSON.parse('${logEmbed}')});
                `);
            });
        } else if(payload.txn_type === "subscr_payment") {
            console.log(payload)
            const paymentData = (payload.custom || "").split("-");
            paymentData.shift();
            const guildID = paymentData[0];
            const guild = await req.client.database.fetchGuild(guildID);
            await guild.addPremiumDays(30, "sub_dash_paypal", paymentData[1]);
            await guild.setTrialPeriodEnabled(false);
        }
    });
});

module.exports = router;
