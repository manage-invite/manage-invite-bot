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
    let results = await req.client.shard.broadcastEval(` let guild = this.guilds.cache.get('${req.params.serverID}'); if(guild) guild.toJSON() `);
    let guild = results.find((g) => g);
    if(!guild || !req.userInfos.displayedGuilds || !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)){
        return res.render("404", {
            user: req.userInfos,
            language: req.language,
            currentURL: `${req.client.config.baseURL}${req.originalUrl}`,
            member: req.member,
            discord: req.client.config.discord
        });
    }

    // Fetch guild informations
    let guildInfos = await utils.fetchGuild(guild.id, req.client, req.user.guilds);

    res.render("guild", {
        guild: guildInfos,
        user: req.userInfos,
        language: req.language,
        client: req.client,
        currentURL: `${req.client.config.baseURL}${req.originalUrl}`,
        member: req.member,
        discord: req.client.config.discord
    });

});

router.post("/:serverID/:form", CheckAuth, async (req, res) => {

    // Check if the user has the permissions to edit this guild
    let results = await req.client.shard.broadcastEval(`
    let guild = this.guilds.cache.get('${req.params.serverID}');
    if(guild){
        let toReturn = guild.toJSON();
        toReturn.channels = guild.channels.cache.toJSON();
        toReturn;
    }`);
    let guild = results.find((g) => g);
    if(!guild || !req.userInfos.displayedGuilds || !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)){
        return res.render("404", {
            user: req.userInfos,
            language: req.language,
            currentURL: `${req.client.config.baseURL}${req.originalUrl}`,
            member: req.member,
            discord: req.client.config.discord
        });
    }
    
    let guildData = await req.client.database.fetchGuild(guild.id);
    let data = req.body;

    if(req.params.form === "basic"){
        if(data.hasOwnProperty("prefix") && data.prefix && data.prefix !== guildData.prefix){
            await guildData.setPrefix(data.prefix);
        }
        if(data.hasOwnProperty("language") && availableLanguages.find((l) => l.name === data.language.toLowerCase() || l.aliases.includes(data.language.toLowerCase()))){
            let language = availableLanguages.find((l) => l.name === data.language.toLowerCase() || l.aliases.includes(data.language.toLowerCase()));
            if(language.name !== guildData.language) await guildData.setLanguage(language.name);
        }
    }

    if(req.params.form === "joinDM"){
        if(guildData.premium){
            let enable = data.hasOwnProperty("enable");
            let update = data.hasOwnProperty("update");
            let disable = data.hasOwnProperty("disable");
            if(enable && data.message){
                guildData.joinDM.enabled = true;
                guildData.joinDM.message = data.message;
                await guildData.joinDM.updateData();
            } else if(update && data.message){
                guildData.joinDM.enabled = true;
                guildData.joinDM.message = data.message
                await guildData.joinDM.updateData();
            } else if(disable){
                guildData.joinDM.enabled = false;
                await guildData.joinDM.updateData();
            }
        }
    }

    if(req.params.form === "join"){
        let enable = data.hasOwnProperty("enable");
        let update = data.hasOwnProperty("update");
        let disable = data.hasOwnProperty("disable");
        if(enable && data.message && data.channel){
            let channel = guild.channels.find((ch) =>`#${ch.name}` === data.channel);
            if(channel && channel.type === "text"){
                guildData.join.enabled = true;
                guildData.join.message = data.message;
                guildData.join.channel = channel.id;
                await guildData.join.updateData();
            }
        } else if(update && data.message && data.channel){
            let channel = guild.channels.find((ch) =>`#${ch.name}` === data.channel);
            if(channel && channel.type === "text"){
                guildData.join.enabled = true;
                guildData.join.message = data.message;
                guildData.join.channel = channel.id;
                await guildData.join.updateData();
            }
        } else if(disable){
            guildData.join.enabled = false;
            await guildData.join.updateData();
        }
    }

    if(req.params.form === "leave"){
        let enable = data.hasOwnProperty("enable");
        let update = data.hasOwnProperty("update");
        let disable = data.hasOwnProperty("disable");
        if(enable && data.message && data.channel){
            let channel = guild.channels.find((ch) =>`#${ch.name}` === data.channel);
            if(channel && channel.type === "text"){
                guildData.leave.enabled = true;
                guildData.leave.message = data.message;
                guildData.leave.channel = channel.id;
                await guildData.leave.updateData();
            }
        } else if(update && data.message && data.channel){
            let channel = guild.channels.find((ch) =>`#${ch.name}` === data.channel);
            if(channel && channel.type === "text"){
                guildData.leave.enabled = true;
                guildData.leave.message = data.message;
                guildData.leave.channel = channel.id;
                await guildData.leave.updateData();
            }
        } else if(disable){
            guildData.leave.enabled = false;
            await guildData.leave.updateData();
        }
    }

    res.redirect(303, "/manage/"+guild.id);
});

module.exports = router;