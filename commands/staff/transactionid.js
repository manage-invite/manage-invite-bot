const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");
const Discord  = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "transactionid",
            enabled: true,
            aliases: [ "transac" ],
            clientPermissions: [],
            permLevel: 5,

            slashCommandOptions: {
                description: "Get the subscription ID related to a transaction ID",
                options: [
                    {
                        name: "transactionid",
                        description: "The transaction ID",
                        type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
                        required: true
                    }
                ],
                permissions: [
                    {
                        id: "638688050289049600",
                        type: 1,
                        permission: true
                    }
                ]
            }
        });
    }

    async runInteraction (interaction) {

        const transactionID = interaction.options.getString("transactionid");

        const transactionData = await this.client.database.fetchTransactionData(transactionID);
        if (!transactionData) return interaction.reply("No payment found for that transaction ID...");

        return interaction.reply(`${Constants.Emojis.SUCCESS} | Here is the subscription related to this transaction ID: \`${transactionData.subID}\`. (\`${transactionData.guildID}\`)`);
    }
};
