const { ShardingManager } = require("discord.js");
const manager = new ShardingManager("./index.js", {
    token: require("./config").token,
    totalShards: require("./config").shardCount,
    shardArgs: [ ...process.argv, ...[ '--sharded' ] ]
});

console.log("Hello, "+require("os").userInfo().username+". Thanks for using ManageInvite.");
manager.spawn();