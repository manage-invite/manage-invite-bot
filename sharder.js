const { ShardingManager } = require("discord.js");
const manager = new ShardingManager("./index.js", {
    token: require("./config").token,
    totalShards: 6,
    shardArgs: process.argv
});

console.log("Hello, "+require("os").userInfo().username+". Thanks for using ManageInvite.");
manager.spawn();