module.exports = {
    ipcServerPort: 3200,
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
    dashLogs:       "XXXXXXXXXXX",
    statsLogs:      "XXXXXXXXXXX",
    premiumLogs:    "XXXXXXXXXXX",
    voteLogs:       "XXXXXXXXXXX",
    /* Dashboard */
    secret:         "XXXXXXXXXXX",
    baseURL:        "XXXXXXXXXXX",
    port:           3100,
    pswd:           "XXXXXXXXXXX",
    failureURL:     "https://docs.manage-invite.xyz",
    /* Other */
    discord:        "XXXXXXXXXXX",
    prefix:         "+",
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
        user: ""
    }
};