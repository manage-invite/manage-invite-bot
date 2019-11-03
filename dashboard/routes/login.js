const express = require("express"),
config = require("../../config"),
router = express.Router(),
CheckAuth = require("../auth/CheckAuth"),
passport = require("passport"),
Discord = require("discord.js");

// Gets login page
router.get("/", passport.authenticate("discord", { failureRedirect: config.failureURL }), async function(req, res) {
    if(!req.user.id || !req.user.guilds) res.redirect("/");
    let user = await req.client.users.fetch(req.user.id);
    req.client.shard.broadcastEval(`let channel = this.channels.get(this.config.dashLogs); if(channel) channel.send({ embed: JSON.parse('${JSON.stringify({
        color: req.client.config.color,
        author: {
            name: user.tag+" connected to the dashboard!"
        }
    })}') });`);
    res.redirect("/");
});

module.exports = router;