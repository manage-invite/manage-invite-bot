const config = require("../config"),
Discord = require("discord.js"),
utils = require("./utils"),
CheckAuth = require("./auth/CheckAuth");

const availableLanguages = [
    { name: "french", aliases: [ "francais", "fr", "français" ] },
    { name: "english", aliases: [ "en", "englich" ] }
];

module.exports.load = async (client) => {

    /* Init express app */

    const express = require("express"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    path = require("path"),
    app = express();

    const passport = require("passport");
    const { Strategy } = require("passport-discord");

    /* Routers */
    const mainRouter = require("./routes/index"),
    guildManager = require("./routes/guild"),
    loginRouter = require("./routes/login");

    /* App configuration */
    app
    // Body parser (for post method)
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    // Set the engine to html (for ejs template)
    .engine("html", require("ejs").renderFile)
    .set("view engine", "ejs")
    // Set the css and js folder to ./public
    .use(express.static(path.join(__dirname, "/public")))
    // Set the ejs templates to ./views
    .set("views", path.join(__dirname, "/views"))
    // Set the dashboard port
    .set("port", config.port)
    // Set the express session password and configuration
    .use(session({ secret: config.pswd, resave: false, saveUninitialized: false }))
    // Passport (for discord authentication)
    .use(passport.initialize())
    .use(passport.session())
    // Multi languages support
    .use(async function(req, res, next){
        req.client = client;
        let userLang = req.user ? req.user.locale : "en";
        req.language = require("../languages/"+availableLanguages.find((l) => l.name === userLang || l.aliases.includes(userLang)).name);
        if(req.user && req.url !== "/") req.userInfos = await utils.fetchUser(req.user, req.client);
        next();
    })
    .use("/manage", guildManager)
    .use("/login", loginRouter)
    .use("/", mainRouter)
    .use(CheckAuth, function(req, res, next){
        res.status(404).render("404", {
            user: req.userInfos,
            language: req.language,
            currentURL: `${req.protocol}://${req.get("host")}${req.originalUrl}`
        });
    })
    .use(CheckAuth, function(err, req, res, next) {
        console.error(err.stack);
        if(!req.user) return res.redirect("/");
        res.status(500).render("500", {
            user: req.userInfos,
            language: req.language,
            currentURL: `${req.protocol}://${req.get("host")}${req.originalUrl}`
        });
    });

    // Listen
    app.listen(app.get("port"), (err) => {
        console.log("ManageInvite dashboard is listening on port "+app.get("port"));
    });

    // Passport is used for discord authentication
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    let disStrat = new Strategy({
        clientID:       client.user.id,
        clientSecret:   config.secret,
        callbackURL:    config.baseURL+"/login",
        scope:          [ "identify", "guilds" ]
    }, function (accessToken, refreshToken, profile, done){
        process.nextTick(function(){
            return done(null, profile);
        });
    });

    passport.use(disStrat);
};