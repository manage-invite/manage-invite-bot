const Command = require("../../structures/Command.js");
const Constants = require("../helpers/constants");

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
        if (!transactionID) return message.error("You must specify a valid transaction ID!");

        const transactionData = await this.client.database.fetchTransactionData(transactionID);
        if (!transactionData) return message.error("No payment found for that transaction ID...");

        return message.channel.send(`${Constants.Emojis.SUCCESS} | Here is the subscription related to this transaction ID: \`${transactionData.subID}\`. (\`${transactionData.guildID}\`)`);
    }
};
