const express = require("express"),
config = require("../../config"),
router = express.Router(),
CheckAuth = require("../auth/CheckAuth"),
Discord = require("discord.js");

const fetch = require("node-fetch"),
btoa = require("btoa");

// Gets login page
router.get("/login", async function(req, res) {
    if(!req.user || !req.user.id || !req.user.guilds){
        return res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${req.client.user.id}&scope=identify%20guilds&response_type=code&redirect_uri=${encodeURIComponent(req.client.config.baseURL+"/api/callback")}&state=${req.query.state || "no"}`);
    }
    res.redirect("/selector");
});

router.get("/callback", async (req, res) => {
    if(req.query.state.startsWith("invite")){
        if(req.query.code){
            let guildID = req.query.state.substr("invite".length, req.query.state.length);
            req.client.knownGuilds.push({ id: guildID, user: req.user.id });
            return res.redirect("/manage/"+guildID);
        } else {
            return res.redirect("/selector");
        }
    }
    if(!req.query.code) res.redirect(req.client.config.failureURL);
    let redirectURL = req.client.states[req.query.state] || "/selector";
    let response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${req.query.code}&redirect_uri=${req.client.config.baseURL}/api/callback`, {
        method: "POST",
        headers: { Authorization: `Basic ${btoa(`${req.client.user.id}:${req.client.config.secret}`)}`, }
    });
    // Fetch tokens (used to fetch user informations)
    let tokens = await response.json();
    // If the code isn't valid
    if(tokens.error || !tokens.access_token) return res.redirect(`/api/login&state=${req.query.state}`);
    let userData = {
        infos: null,
        guilds: null
    };
    while(!userData.infos || !userData.guilds){
        /* User infos */
        if(!userData.infos){
            response = await fetch("http://discordapp.com/api/users/@me", {
                method: "GET",
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            });
            let json = await response.json();
            if(json.retry_after) await req.client.wait(json.retry_after);
            else userData.infos = json;
        }
        /* User guilds */
        if(!userData.guilds){
            response = await fetch("https://discordapp.com/api/users/@me/guilds", {
                method: "GET",
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            });
            let json = await response.json();
            if(json.retry_after) await req.client.wait(json.retry_after);
            else userData.guilds = json;
        }
    }
    /* Change format (from "0": { data }, "1": { data }, etc... to [ { data }, { data } ]) */
    let guilds = [];
    for(let guildPos in userData.guilds) guilds.push(userData.guilds[guildPos]);
    // Update session
    req.session.user = { ... userData.infos, ... { guilds } };
    let user = await req.client.users.fetch(req.session.user.id);
    req.client.shard.broadcastEval(`let channel = this.channels.cache.get(this.config.dashLogs); if(channel) channel.send({ embed: JSON.parse('${JSON.stringify({
        color: req.client.config.color,
        author: {
            name: user.tag+" connected to the dashboard!"
        }
    })}') });`);
    res.redirect(redirectURL);
});

module.exports = router;