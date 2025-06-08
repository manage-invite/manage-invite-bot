module.exports = {
    ipcServerPort: 3200,
    ipcServerHost: "",
    token:          "XXXXXXXXXXX",
    shardCount:     2,
    /* Status */
    statusWebhook: {
        id: "XXXXXXXXXXX",
        token: "XXXXXXXXXXX"
    },
    /* Logs */
    addLogs:        "XXXXXXXXXXX",
    removeLogs:     "XXXXXXXXXXX",
    premiumLogs:    "XXXXXXXXXXX",
    voteLogs:       "XXXXXXXXXXX",
    /* Other */
    discord:        "XXXXXXXXXXX",
    owners: [ "XXXXXXXXXXX", "XXXXXXXXXXX" ],
    modRole:        "XXXXXXXXXXX",
    premiumRole:    "XXXXXXXXXXX",
    supportServer:  "XXXXXXXXXXX",
    sentryDSN:      "XXXXXXXXXXX",
    /* Top.gg */
    topToken: "XXXXXXXXXXX",
    topAuth: "XXXXXXXXXXX",
    /* Database */
    postgres: {
        user: "",
        host: "localhost",
        database: "manage_invite",
        password: "",
        port: 5432
    },
    redis: {
        host: "",
        port: 6379,
        password: ""
    }
};