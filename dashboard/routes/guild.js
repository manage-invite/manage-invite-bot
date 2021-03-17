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

    console.log(req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID));
    if (!req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID).isPremium){
        return res.redirect("/");
    }

    // Fetch guild informations
    const guildInfos = await utils.fetchGuild(guild.id, req.client, req.translate);
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
    const guildInfos = await utils.fetchGuild(req.params.serverID, req.client, req.translate);
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
    
    const guildSettings = await req.client.database.fetchGuildSettings(req.params.serverID);
    const guildPlugins = await req.client.database.fetchGuildPlugins(req.params.serverID);
    const data = req.body;

    if (req.params.form === "basic"){
        if (Object.prototype.hasOwnProperty.call(data, "prefix") && data.prefix && data.prefix !== guildSettings.prefix){
            await req.client.database.updateGuildSetting(req.params.serverID, {
                prefix: data.prefix
            });
        }
        if (Object.prototype.hasOwnProperty.call(data, "language") && req.client.enabledLanguages.find((l) => l.name.toLowerCase() === data.language.toLowerCase() || (l.aliases.map((a) => a.toLowerCase())).includes(data.language.toLowerCase()))){
            const language = req.client.enabledLanguages.find((l) => l.name.toLowerCase() === data.language.toLowerCase() || (l.aliases.map((a) => a.toLowerCase())).includes(data.language.toLowerCase()));
            if (language.name !== guildSettings.language) await req.client.database.updateGuildSetting(req.params.serverID, {
                language: language.name
            });
        }
    }

    if (req.params.form === "ranks") {
        const stackedRanks = !Object.prototype.hasOwnProperty.call(data, "stacked-ranks");
        const keepRanks = Object.prototype.hasOwnProperty.call(data, "keep-ranks");
        if (stackedRanks && !guildSettings.stackedRanks) {
            await req.client.database.updateGuildSetting(req.params.serverID, {
                stackedRanks: true
            });
        } else if (!stackedRanks && guildSettings.stackedRanks) {
            await req.client.database.updateGuildSetting(req.params.serverID, {
                stackedRanks: false
            });
        }
        if (keepRanks && !guildSettings.keepRanks) {
            await req.client.database.updateGuildSetting(req.params.serverID, {
                keepRanks: true
            });
        } else if (!keepRanks && guildSettings.keepRanks) {
            await req.client.database.updateGuildSetting(req.params.serverID, {
                keepRanks: false
            });
        }
    }

    if (req.params.form === "joinDM"){
        const enable = Object.prototype.hasOwnProperty.call(data, "enable");
        const update = Object.prototype.hasOwnProperty.call(data, "update");
        const disable = Object.prototype.hasOwnProperty.call(data, "disable");
        if ((enable || update) && data.mainMessage){
            await req.client.database.updateGuildPlugin(req.params.serverID, "joinDM", {
                enabled: true,
                mainMessage: data.mainMessage,
                oauth2Message: data.oauth2Message,
                vanityMessage: data.vanityMessage,
                unknownMessage: data.unknownMessage
            });
        } else if (disable){
            const previousData = guildPlugins.find((p) => p.pluginName === "joinDM").pluginData;
            await req.client.database.updateGuildPlugin(req.params.serverID, "joinDM", {
                ...previousData,
                enabled: false
            });
        }
    }

    if (req.params.form === "join"){
        const enable = Object.prototype.hasOwnProperty.call(data, "enable");
        const update = Object.prototype.hasOwnProperty.call(data, "update");
        const disable = Object.prototype.hasOwnProperty.call(data, "disable");
        if ((enable || update) && data.mainMessage && data.channel){
            const channel = guild.channels.find((ch) =>`#${ch.name}` === data.channel);
            if (channel && channel.type === "text"){
                await req.client.database.updateGuildPlugin(req.params.serverID, "join", {
                    enabled: true,
                    mainMessage: data.mainMessage,
                    oauth2Message: data.oauth2Message,
                    vanityMessage: data.vanityMessage,
                    unknownMessage: data.unknownMessage,
                    channel: channel.id
                });
            }
        } else if (disable){
            const previousData = guildPlugins.find((p) => p.pluginName === "join").pluginData;
            await req.client.database.updateGuildPlugin(req.params.serverID, "join", {
                ...previousData,
                enabled: false
            });
        }
    }

    if (req.params.form === "leave"){
        const enable = Object.prototype.hasOwnProperty.call(data, "enable");
        const update = Object.prototype.hasOwnProperty.call(data, "update");
        const disable = Object.prototype.hasOwnProperty.call(data, "disable");
        if ((enable || update) && data.mainMessage && data.channel){
            const channel = guild.channels.find((ch) =>`#${ch.name}` === data.channel);
            if (channel && channel.type === "text"){
                await req.client.database.updateGuildPlugin(req.params.serverID, "leave", {
                    enabled: true,
                    mainMessage: data.mainMessage,
                    oauth2Message: data.oauth2Message,
                    vanityMessage: data.vanityMessage,
                    unknownMessage: data.unknownMessage,
                    channel: channel.id
                });
            }
        } else if (disable){
            const previousData = guildPlugins.find((p) => p.pluginName === "leave").pluginData;
            await req.client.database.updateGuildPlugin(req.params.serverID, "leave", {
                ...previousData,
                enabled: false
            });
        }
    }

    res.redirect(303, "/manage/"+guild.id);
});

module.exports = router;