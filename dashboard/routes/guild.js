const express = require("express"),
    utils = require("../utils"),
    CheckAuth = require("../auth/CheckAuth"),
    router = express.Router();

router.get("/:serverID", CheckAuth, async (req, res) => {

    // Check if the user has the permissions to edit this guild
    const results = await req.client.shard.broadcastEval(` let guild = this.guilds.cache.get('${req.params.serverID}'); if(guild) guild.toJSON() `);
    const guild = results.find((g) => g);
    if (!guild || !req.userInfos.displayedGuilds || !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)){
        return res.render("404", {
            user: req.userInfos,
            translate: req.translate,
            currentURL: `${req.client.config.baseURL}${req.originalUrl}`,
            member: req.member,
            discord: req.client.config.discord,
            locale: req.user.locale
        });
    }

    if (!req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID).isPremium){
        res.redirect("/payment/"+guild.id+"/paypal");
    }

    // Fetch guild informations
    const guildInfos = await utils.fetchGuild(guild.id, req.client, req.user.guilds, req.user.locale);

    res.render("guild", {
        guild: guildInfos,
        user: req.userInfos,
        translate: req.translate,
        currentURL: `${req.client.config.baseURL}${req.originalUrl}`,
        member: req.member,
        discord: req.client.config.discord,
        locale: req.user.locale
    });

});

router.get("/:serverID/createsub", CheckAuth, async (req, res) => {
    const guildInfos = await utils.fetchGuild(req.params.serverID, req.client, req.user.guilds, req.user.locale);
    res.render("create-sub", {
        guild: guildInfos,
        user: req.userInfos,
        translate: req.translate,
        currentURL: `${req.client.config.baseURL}${req.originalUrl}`,
        member: req.member,
        discord: req.client.config.discord,
        locale: req.user.locale,
        paypal: req.client.config.paypal.mode === "live" ? req.client.config.paypal.live : req.client.config.paypal.sandbox
    });
});

router.post("/:serverID/:form", CheckAuth, async (req, res) => {

    // Check if the user has the permissions to edit this guild
    const results = await req.client.shard.broadcastEval(`
    let guild = this.guilds.cache.get('${req.params.serverID}');
    if(guild){
        let toReturn = guild.toJSON();
        toReturn.channels = guild.channels.cache.toJSON();
        toReturn;
    }`);
    const guild = results.find((g) => g);
    if (!guild || !req.userInfos.displayedGuilds || !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)){
        return res.render("404", {
            user: req.userInfos,
            translate: req.translate,
            currentURL: `${req.client.config.baseURL}${req.originalUrl}`,
            member: req.member,
            discord: req.client.config.discord,
            locale: req.user.locale
        });
    }
    
    const guildData = await req.client.database.fetchGuild(guild.id);
    const data = req.body;

    if (req.params.form === "basic"){
        if (Object.prototype.hasOwnProperty.call(data, "prefix") && data.prefix && data.prefix !== guildData.prefix){
            await guildData.setPrefix(data.prefix);
        }
        if (Object.prototype.hasOwnProperty.call(data, "language") && req.client.config.enabledLanguages.find((l) => l.name.toLowerCase() === data.language.toLowerCase() || (l.aliases.map((a) => a.toLowerCase())).includes(data.language.toLowerCase()))){
            const language = req.client.config.enabledLanguages.find((l) => l.name.toLowerCase() === data.language.toLowerCase() || (l.aliases.map((a) => a.toLowerCase())).includes(data.language.toLowerCase()));
            if (language.name !== guildData.language) await guildData.setLanguage(language.name);
        }
    }

    if (req.params.form === "joinDM"){
        const enable = Object.prototype.hasOwnProperty.call(data, "enable");
        const update = Object.prototype.hasOwnProperty.call(data, "update");
        const disable = Object.prototype.hasOwnProperty.call(data, "disable");
        if (enable && data.mainMessage){
            guildData.joinDM.enabled = true;
            guildData.joinDM.mainMessage = data.mainMessage;
            guildData.joinDM.oauth2Message = data.oauth2Message;
            guildData.joinDM.vanityMessage = data.vanityMessage;
            guildData.joinDM.unknownMessage = data.unknownMessage;
            await guildData.joinDM.updateData();
        } else if (update && data.mainMessage){
            guildData.joinDM.enabled = true;
            guildData.joinDM.mainMessage = data.mainMessage;
            guildData.joinDM.oauth2Message = data.oauth2Message;
            guildData.joinDM.vanityMessage = data.vanityMessage;
            guildData.joinDM.unknownMessage = data.unknownMessage;
            await guildData.joinDM.updateData();
        } else if (disable){
            guildData.joinDM.enabled = false;
            await guildData.joinDM.updateData();
        }
    }

    if (req.params.form === "join"){
        const enable = Object.prototype.hasOwnProperty.call(data, "enable");
        const update = Object.prototype.hasOwnProperty.call(data, "update");
        const disable = Object.prototype.hasOwnProperty.call(data, "disable");
        if (enable && data.mainMessage && data.channel){
            const channel = guild.channels.find((ch) =>`#${ch.name}` === data.channel);
            if (channel && channel.type === "text"){
                guildData.join.enabled = true;
                guildData.join.mainMessage = data.mainMessage;
                guildData.join.oauth2Message = data.oauth2Message;
                guildData.join.vanityMessage = data.vanityMessage;
                guildData.join.unknownMessage = data.unknownMessage;
                guildData.join.channel = channel.id;
                await guildData.join.updateData();
            }
        } else if (update && data.mainMessage && data.channel){
            const channel = guild.channels.find((ch) =>`#${ch.name}` === data.channel);
            if (channel && channel.type === "text"){
                guildData.join.enabled = true;
                guildData.join.mainMessage = data.mainMessage;
                guildData.join.oauth2Message = data.oauth2Message;
                guildData.join.vanityMessage = data.vanityMessage;
                guildData.join.unknownMessage = data.unknownMessage;
                guildData.join.channel = channel.id;
                await guildData.join.updateData();
            }
        } else if (disable){
            guildData.join.enabled = false;
            await guildData.join.updateData();
        }
    }

    if (req.params.form === "leave"){
        const enable = Object.prototype.hasOwnProperty.call(data, "enable");
        const update = Object.prototype.hasOwnProperty.call(data, "update");
        const disable = Object.prototype.hasOwnProperty.call(data, "disable");
        if (enable && data.mainMessage && data.channel){
            const channel = guild.channels.find((ch) =>`#${ch.name}` === data.channel);
            if (channel && channel.type === "text"){
                guildData.leave.enabled = true;
                guildData.leave.mainMessage = data.mainMessage;
                guildData.leave.oauth2Message = data.oauth2Message;
                guildData.leave.vanityMessage = data.vanityMessage;
                guildData.leave.unknownMessage = data.unknownMessage;
                guildData.leave.channel = channel.id;
                await guildData.leave.updateData();
            }
        } else if (update && data.mainMessage && data.channel){
            const channel = guild.channels.find((ch) =>`#${ch.name}` === data.channel);
            if (channel && channel.type === "text"){
                guildData.leave.enabled = true;
                guildData.leave.mainMessage = data.mainMessage;
                guildData.leave.oauth2Message = data.oauth2Message;
                guildData.leave.vanityMessage = data.vanityMessage;
                guildData.leave.unknownMessage = data.unknownMessage;
                guildData.leave.channel = channel.id;
                await guildData.leave.updateData();
            }
        } else if (disable){
            guildData.leave.enabled = false;
            await guildData.leave.updateData();
        }
    }

    res.redirect(303, "/manage/"+guild.id);
});

module.exports = router;