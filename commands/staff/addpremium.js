const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "addpremium",
            enabled: true,
            aliases: [ "add-premium" ],
            clientPermissions: [],
            permLevel: 5
        });
    }

    async run (message, args, data) {

        const premiumArgs = {
            guildID: args[0],
            daysCount: parseInt(args[1]),
            amount: parseInt(args[2]),
            user: message.mentions.users.first() || await this.client.users.fetch(args[3]).catch(() => {}),
            pmtType: args[4],
            guildsCount: parseInt(args[5]),
            label: parseInt(args[6])
        }

        let send = false;
        Object.keys(premiumArgs).forEach((key) => {
            if(!premiumArgs[key] && !send){
                send = true;
                return message.channel.send(`${this.client.config.emojis.error} | Invalid args. ${Object.keys(premiumArgs).join(', ')}. Missing **${key}**.`);
            }
        });

        const createdAt = new Date();

        const paymentID = await this.client.database.createPayment({
            payerDiscordID: premiumArgs.user.id,
            payerDiscordUsername: premiumArgs.user.tag,
            modID: message.author.id,
            amount: premiumArgs.amount,
            type: premiumArgs.pmtType,
            createdAt
        });

        const subscription = await this.client.database.createSubscription({
            expiresAt: new Date(Date.now()+(premiumArgs.daysCount*24*60*60*1000)),
            createdAt,
            guildsCount: premiumArgs.guildsCount,
            subLabel: premiumArgs.label
        }, false);
        await this.client.database.createSubPaymentLink(subscription.id, paymentID);
        await this.client.database.createGuildSubLink(premiumArgs.guildID, subscription.id);
        await subscription.deleteGuildsFromCache();

        return message.channel.send(`${this.client.emojis.success} | Subscription created. Get more informations with \`${message.guild.data.prefix}sub ${premiumArgs.guildID}\`.`);

    }
};
