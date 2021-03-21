const { black, green, cyan, greenBright, blueBright } = require("chalk");

const getDatePrefix = () => {
    const date = new Date();
    return "[" + (date.getFullYear() + "-" +
    (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
    (date.getDate()).toString().padStart(2, "0") + " " +
    date.getHours().toString().padStart(2, "0") + ":" +
    date.getMinutes().toString().padStart(2, "0") + ":" +
    date.getSeconds().toString().padStart(2, "0") + "." +
    date.getMilliseconds().toString().padStart(3, "0")) + "]:";
};

module.exports = (content, type) => {
    
    const shardID = process.env.SHARDS ? `Shard ${process.env.SHARDS}/${process.env.SHARD_COUNT} ` : "";

    switch (type) {
    case "warn":
        console.log(`${shardID}${getDatePrefix()} ${black.bgYellow("[WARN]")} ${content}`);
        break;
    case "error":
        console.log(`${shardID}${getDatePrefix()} ${black.bgRed("[ERROR]")} ${content}`);
        break;
    case "debug":
        console.log(`${shardID}${getDatePrefix()} ${greenBright("[DEBUG]")} ${content}`);
        break;
    case "cmd":
        console.log(`${shardID}${getDatePrefix()} ${black.bgWhite("[CMD]")} ${content}`);
        break;
    case "redis": 
        console.log(`${shardID}${getDatePrefix()} ${cyan("[REDIS]")} ${content}`);
        break;
    case "postgres":
        console.log(`${shardID}${getDatePrefix()} ${green("[POSTGRES]")} ${content}`);
        break;
    default:
        console.log(`${shardID}${getDatePrefix()} ${blueBright("[LOG]")} ${content}`);
    }
};