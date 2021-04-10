const { Client } = require("veza");

module.exports.load = (discordClient) => {

    let firstConnect = false;

    const node = new Client(`ManageInvite Shard #${discordClient.shard.ids[0]}`, {
        retryTime: 1000
    })
        .on("error", (error, client) =>
            console.error(`[IPC] Error from ${client.name}:`, error))
        .on("disconnect", (client) => 
            console.error(`[IPC] Disconnected from ${client.name}`))
        .on("ready", async (client) => {
            console.log(`[IPC] Ready, connected to: ${client.name}`);
        });

    const connect = () => {
        node.connectTo(discordClient.config.ipcServerPort)
            .then(() => firstConnect = true)
            .catch((error) => {
                if (error.message.includes("ECONNREFUSED")) return;
                else console.log("[IPC] Disconnected!", error);
            });
    };

    // eslint-disable-next-line consistent-return
    node.on("message", async (message) => {
        if (message.data.event === "collectData") {
            // eslint-disable-next-line no-eval
            message.reply(eval(`client.${message.data.data}`));
        }
    });

    setInterval(() => {
        if (!firstConnect) connect();
    }, 1000);

    connect();
};
