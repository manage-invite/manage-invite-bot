const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "transactionid",
            enabled: true,
            aliases: [ "transac" ],
            clientPermissions: [],
            permLevel: 5
        });
    }

    async run (message, args) {

        const transactionID = args[0];
        if(!transactionID) return message.error("You must specify a valid transaction ID!");

        const { rows } = await this.client.database.query(`
            SELECT * FROM payments
            WHERE transaction_id = '${transactionID}';
        `);

        if(!rows[0]) return message.error("No payment found for that transaction ID...");

        const { rows: rowsSubs } = await this.client.database.query(`
            SELECT * FROM subscriptions_payments
            WHERE payment_id = '${rows[0].id}'
        `);

        const { rows: rowsGuilds } = await this.client.database.query(`
            SELECT * FROM guilds_subscriptions
            WHERE sub_id = '${rowsSubs[0].sub_id}';
        `);

        return message.channel.send(`${this.client.config.emojis.success} | Here is the subscription related to this transaction ID: \`${rowsSubs[0].sub_id}\`. (\`${rowsGuilds[0].guild_id}\`)`);
    }
};
