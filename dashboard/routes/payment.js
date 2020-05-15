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
        const valid = await paypalRes.text() === "VERIFIED";
        if(!valid) return console.log("Invalid payment");
        if(payload.tnx_type === "subscr_signup"){
            if(payload.amout3 !== '1.00') return;
            const paymentData = (payload.custom || "").split("-");
            const guildID = paymentData[0];
            const userID = paymentData[1];
            const guildInfos = await utils.fetchGuild(guildID, req.client);
            const guild = await req.client.database.fetchGuild(guildID);
            await guild.addPremiumDays(30, "sub_dash_paypal", paymentData[1]);
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
        } else if(tnx_type === "subscr_payment") {
            console.log(payload)
            const paymentData = (payload.custom || "").split("-");
            const guildID = paymentData[0];
            const guild = await req.client.database.fetchGuild(guildID);
            await guild.addPremiumDays(30, "sub_dash_paypal", paymentData[1]);
        }
    });
});

module.exports = router;
