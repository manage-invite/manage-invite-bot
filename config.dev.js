module.exports = {
    token:          "NjM5ODE3MDgwNjY0ODgzMjAw.XbwyFw.cGhr8EZVAjMV8I_pc-0Wv6ZLN_U",
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
    secret:         "CBvu5deqra6Rhh2ZrNL-IPP68UcEG9te",
    baseURL:        "http://149.91.80.137:3200",
    port:           3200,
    pswd:           "XXXXXXXXXXX",
    failureURL:     "https://docs.manage-invite.xyz",
    /* Other */
    mongodb:        "XXXXXXXXXXX",
    discord:        "XXXXXXXXXXX",
    prefix:         "+",
    owners: [ "422820341791064085" ],
    modRole:        "XXXXXXXXXXX",
    premiumRole:    "XXXXXXXXXXX",
    supportServer:  "XXXXXXXXXXX",
    sentryDSN:      "XXXXXXXXXXX",
    /* Top.gg */
    topToken: "XXXXXXXXXXX",
    topAuth: "XXXXXXXXXXX",
    /* Database */
    database: {
        user: "",
        host: "localhost",
        database: "manage_invite_eight",
        password: "",
        port: 5432
    },
    redis: {
        user: ""
    },
    /* PayPal */
    paypal: {
        mode: "sandbox",
        live: {
            email: "XXXXXXXXXXX",
            returnURL: "https://dash.manage-invite.xyz/payment/callback",
            cancelURL: "https://dash.manage-invite.xyz/selector",
            ipnURL: "https://dash.manage-invite.xyz/payment/ipn",
            formURL: "https://www.paypal.com/cgi-bin/webscr",
            fetchURL: "https://ipnpb.paypal.com/cgi-bin/webscr?cmd=_notify-validate",
            ptdToken: "XXXXXXXXXXX"
        },
        sandbox: {
            email: "XXXXXXXXXXX",
            returnURL: "http://localhost:3100/payment/callback",
            cancelURL: "http://localhost:3100/",
            ipnURL: "http://ngork.io/payment/ipn",
            formURL: "https://www.sandbox.paypal.com/cgi-bin/webscr",
            fetchURL: "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr?cmd=_notify-validate",
            pdtToken: "XXXXXXXXXXX"
        }
    }
};
