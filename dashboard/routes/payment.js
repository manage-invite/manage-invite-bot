const express = require("express"),
CheckAuth = require("../auth/CheckAuth"),
fetch = require("node-fetch"),
router = express.Router(),
utils = require("../utils");

const Discord = require("discord.js");

router.get("/", CheckAuth, async (_req, res) => {
    res.redirect("/selector");
});

router.post("/ipn", async (req, res) => {
    const payload = req.body;
    res.sendStatus(200);
    const payloadCopy = new URLSearchParams(payload);
    payloadCopy.set("cmd", "_notify-validate");
    fetch(req.client.config.paypal.mode === "live" ? req.client.config.paypal.live : req.client.config.paypal.sandbox, {
        method: "POST",
        body: payloadCopy.toString()
    }).then(async (paypalRes) => {
        const valid = (await paypalRes.text() === "VERIFIED") && payload.txn_type === "subscr_signup" && payload.amount3 === '2.00';
        if(!valid) return console.log('Invalid payment');
        const paymentData = (payload.custom || "").split("-");
        const paymentType = paymentData[0];
        if(paymentType === "premium_month"){
            const guildID = paymentData[1];
            const userID = paymentData[2];
            const guildInfos = await utils.fetchGuild(guildID, req.client);
            const guild = await req.client.database.fetchGuild();
            await guild.addPremiumMonth();
            req.client.users.fetch(userID).then((user) => {
                const embed = new Discord.MessageEmbed()
                .setAuthor(`Thanks for purchasing ManageInvite Premium, ${user.tag}`, user.displayAvatarURL())
                .setDescription(`Congratulations, your server **${guildInfos.name}** is now premium! :crown:`)
                .setColor("#F4831B");
                user.send(embed);
                const logEmbed = JSON.stringify(new Discord.MessageEmbed()
                .setAuthor(`${user.tag} purchased ManageInvite Premium`, user.displayAvatarURL())
                .setDescription(`Server **${guildInfos.name}** is now premium (**$1/month**) :crown:`)
                .setColor("#F4831B")).replace(/[\/\(\)\']/g, "\\$&");
                let { premiumLogs } = req.client.config;
                req.client.shard.broadcastEval(`
                    let aLogs = this.channels.cache.get('${premiumLogs}');
                    if(aLogs) aLogs.send({ embed: JSON.parse('${logEmbed}')});
                `);
            });
        }
    });
});

module.exports = router;
