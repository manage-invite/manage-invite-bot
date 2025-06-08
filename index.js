if (!process.argv.includes("--sharded")){
    console.log("Please start ManageInvite with the sharder.js file!");
    process.exit(0);
}

const util = require("util"),
    fs = require("fs"),
    readdir = util.promisify(fs.readdir);

const Constants = require("./helpers/constants");
const config = require("./config.js");
const Sentry = require("@sentry/node");
Sentry.init({ dsn: config.sentryDSN });

// Load ManageInvite class
const ManageInvite = require("./structures/Client"),
    client = new ManageInvite();

const init = async () => {

    require("./helpers/extenders");

    // Search for all commands
    const directories = await readdir("./commands/");
    directories.forEach(async (dir) => {
        const commands = await readdir("./commands/"+dir+"/");
        commands.filter((cmd) => cmd.split(".").pop() === "js").forEach((cmd) => {
            const response = client.loadCommand("./commands/"+dir, cmd);
            if (response){
                client.log(response, "error");
            }
        });
    });

    // Then we load events, which will include our message and ready event.
    const evtFiles = await readdir("./events/");
    evtFiles.forEach((file) => {
        const eventName = file.split(".")[0];
        const event = new (require(`./events/${file}`))(client);
        client.on(eventName, (...args) => event.run(...args));
        delete require.cache[require.resolve(`./events/${file}`)];
    });

    const i18n = require("./helpers/i18n");
    client.translations = await i18n();

    await client.database.connect();

    // Gets commands permission
    client.levelCache = {};
    for (let i = 0; i < client.permLevels.length; i++) {
        const thisLevel = client.permLevels[parseInt(i, 10)];
        client.levelCache[thisLevel.name] = thisLevel.level;
    }

    client.on("shardReady", (shardID) => {
        client.functions.sendStatusWebhook(`${Constants.Emojis.DND} | Shard #${shardID} is ready!`);
    });
    client.on("shardDisconnect", (shardID) => {
        client.functions.sendStatusWebhook(`${Constants.Emojis.OFFLINE} | Shard #${shardID} is disconnected...`);
    });
    client.on("shardReconnecting", (shardID) => {
        client.functions.sendStatusWebhook(`${Constants.Emojis.IDLE} | Shard #${shardID} is reconnecting...`);
    });
    client.on("shardResume", (shardID) => {
        client.functions.sendStatusWebhook(`${Constants.Emojis.ONLINE} | Shard #${shardID} has resumed!`);
    });

    client.login(client.config.token); // Log in to the discord api

};

init();

// if there are errors, log them
client.on("disconnect", () => client.log("Bot is disconnecting...", "warn"))
    .on("reconnecting", () => client.log("Bot reconnecting...", "log"))
    .on("error", (e) => {
        console.error(e);
        client.log(e, "error");
    })
    .on("warn", (info) => client.log(info, "warn"));

// if there is an unhandledRejection, log them
process.on("unhandledRejection", (err) => {
    console.error(err);
});