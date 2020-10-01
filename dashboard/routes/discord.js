const express = require("express"),
    router = express.Router(),
    fetch = require("node-fetch"),
    btoa = require("btoa"),
    Discord = require("discord.js");

// Gets login page
router.get("/login", async function (req, res) {
    if (!req.user || !req.user.id || !req.user.guilds){
        return res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${req.client.user.id}&scope=identify%20guilds&response_type=code&redirect_uri=${encodeURIComponent(req.client.config.baseURL+"/api/callback")}&state=${req.query.state || "no"}`);
    }
    res.redirect("/selector");
});

router.get("/callback", async (req, res) => {
    if (req.query.state.startsWith("invite")){
        if (req.query.code){
            const guildID = req.query.state.substr("invite".length, req.query.state.length);
            req.client.knownGuilds.push({ id: guildID, user: req.user.id });
            return res.redirect("/manage/"+guildID);
        } else {
            return res.redirect("/selector");
        }
    }
    if (!req.query.code) return res.redirect(req.client.config.failureURL);
    const redirectURL = req.client.states[req.query.state] || "/selector";
    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code");
    params.set("code", req.query.code);
    params.set("redirect_uri", `${req.client.config.baseURL}/api/callback`);
    let response = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: params.toString(),
        headers: {
            Authorization: `Basic ${btoa(`${req.client.user.id}:${req.client.config.secret}`)}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
    // Fetch tokens (used to fetch user informations)
    const tokens = await response.json();
    // If the code isn't valid
    if (tokens.error || !tokens.access_token) return res.redirect(`/api/login&state=${req.query.state}`);
    const userData = {
        infos: null,
        guilds: null
    };
    while (!userData.infos || !userData.guilds){
        /* User infos */
        if (!userData.infos){
            response = await fetch("http://discordapp.com/api/users/@me", {
                method: "GET",
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            });
            const json = await response.json();
            if (json.retry_after) await req.client.wait(json.retry_after);
            else userData.infos = json;
        }
        /* User guilds */
        if (!userData.guilds){
            response = await fetch("https://discordapp.com/api/users/@me/guilds", {
                method: "GET",
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            });
            const json = await response.json();
            if (json.retry_after) await req.client.wait(json.retry_after);
            else userData.guilds = json;
        }
    }
    /* Change format (from "0": { data }, "1": { data }, etc... to [ { data }, { data } ]) */
    const guilds = [];
    for (const guildPos in userData.guilds) guilds.push(userData.guilds[guildPos]);
    // Update session
    req.session.user = { ... userData.infos, ... { guilds } };
    const user = await req.client.users.fetch(req.session.user.id);
    const embed = escape(JSON.stringify(new Discord.MessageEmbed()
        .setColor(req.client.config.color)
        .setAuthor(user.tag+" connected to the dashboard!")
    ));
    req.client.shard.broadcastEval(`let channel = this.channels.cache.get(this.config.dashLogs); if(channel) channel.send({ embed: JSON.parse(unescape('${embed}')) });`);
    res.redirect(redirectURL);
});

module.exports = router;