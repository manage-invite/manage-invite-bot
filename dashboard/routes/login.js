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
    res.redirect("/");
});

module.exports = router;