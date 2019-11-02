const availableLanguages = [
    { name: "french", aliases: [ "francais", "fr", "français" ] },
    { name: "english", aliases: [ "en", "englich" ] }
];

const express = require("express"),
utils = require("../utils"),
CheckAuth = require("../auth/CheckAuth"),
router = express.Router();

router.get("/:serverID", CheckAuth, async (req, res) => {

    // Check if the user has the permissions to edit this guild
    let results = await req.client.shard.broadcastEval(` let guild = this.guilds.get('${req.params.serverID}'); if(guild) guild.toJSON() `);
    let guild = results.find((g) => g);
    if(!guild || !req.userInfos.displayedGuilds || !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)){
        return res.render("404", {
            user: req.userInfos,
            language: req.language,
            currentURL: `${req.client.config.baseURL}/${req.originalUrl}`
        });
    }

    // Fetch guild informations
    let guildInfos = await utils.fetchGuild(guild.id, req.client, req.user.guilds);

    res.render("guild", {
        guild: guildInfos,
        user: req.userInfos,
        language: req.language,
        client: req.client,
        currentURL: `${req.client.config.baseURL}/${req.originalUrl}`
    });

});

router.post("/:serverID/:form", CheckAuth, async (req, res) => {

    // Check if the user has the permissions to edit this guild
    let results = await req.client.shard.broadcastEval(` let guild = this.guilds.get('${req.params.serverID}'); if(guild) guild.toJSON() `);
    let guild = results.find((g) => g);
    if(!guild || !req.userInfos.displayedGuilds || !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)){
        return res.render("404", {
            user: req.userInfos,
            language: req.language,
            currentURL: `${req.client.config.baseURL}/${req.originalUrl}`
        });
    }
    
    let guildData = await req.client.findOrCreateGuild({ id: guild.id });
    let data = req.body;

    if(req.params.form === "basic"){
        if(data.hasOwnProperty("prefix") && data.prefix && data.prefix !== guildData.prefix){
            guildData.prefix = data.prefix;
        }
        if(data.hasOwnProperty("language") && data.language && availableLanguages.find((l) => l.name === data.language.toLowerCase() || l.aliases.includes(l.name.toLowerCase()))){
            let language = availableLanguages.find((l) => l.name === data.language.toLowerCase() || l.aliases.includes(l.name.toLowerCase()));
            guildData.language = availableLanguages.find((l) => l.name === data.language.toLowerCase() || l.aliases.includes(l.name.toLowerCase())).name;
        }
    }

    await guildData.save();

    res.redirect(303, "/manage/"+guild.id);
});

module.exports = router;