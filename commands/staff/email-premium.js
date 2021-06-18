const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "email-premium",
            enabled: true,
            aliases: [ "emailpremium" ],
            clientPermissions: [],
            permLevel: 5
        });
    }

    async run (message, args) {

        let guildID = args[0];
        if (!guildID) return message.error("Please specify a valid guild!");

        if (guildID.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-zA-Z\d]/)){
            const invite = await this.client.fetchInvite(guildID);
            guildID = invite.channel.guild.id;
        }

        if (!args[1]) return message.error("Please specify a valid user!");
        const user = message.mentions.users.first() || await this.client.users.fetch(args[1]) || message.guild.members.cache.find((m) => `${m.user.username}#${m.user.discriminator}` === args[1])?.user;
        if (!user) return message.error(`I wasn't able to find a user for \`${args[1]}\``);

        if (!args[2]) return message.error("Please specify a valid transaction ID!");
        const transactionID = args[2];

        if (!args[3] || (args[3] !== "year" && args[3] !== "month")) return message.error("Please specify `year` or `month`!");
        const isMonth = args[3] === "month";

        const guildSubscriptions = await this.client.database.fetchGuildSubscriptions(guildID);
        const guildNames = await this.client.shard.broadcastEval((client, guildID) => {
            const guild = client.guilds.cache.get(guildID);
            if (guild) return guild.name;
        }, { context: guildID });

        const guildNameFound = guildNames.find((r) => r);
        const guildName = guildNameFound || guildID;

        const createdAt = new Date();
        let exists = true;

        let subscription = guildSubscriptions.find((sub) => sub.subLabel === "Premium "+(isMonth ? "Monthly" : "Yearly")+" 1 Guild");
        if (!subscription) {
            exists = false;
            subscription = await this.client.database.createGuildSubscription(guildID, {
                expiresAt: new Date(Date.now()+((isMonth ? 31 : 366)*24*60*60*1000)),
                createdAt,
                guildsCount: 1,
                subLabel: "Premium "+(isMonth ? "Monthly" : "Yearly")+" 1 Guild"
            });
        } else await this.client.database.updateGuildSubscription(subscription.id, guildID, "expiresAt",
            new Date((new Date(subscription.expiresAt).getTime() > Date.now() ? new Date(subscription.expiresAt).getTime() : Date.now()) + ((isMonth ? 31 : 366) * 24 * 60 * 60 * 1000)).toISOString()
        );

        await this.client.database.createSubscriptionPayment(subscription.id, {
            modDiscordID: message.author.id,
            payerDiscordID: user.id,
            payerDiscordUsername: user.tag,
            transactionID,
            modID: message.author.id,
            amount: isMonth ? 2 : 18,
            type: "email_address_pmnt_"+(isMonth ? "month" : "year"),
            createdAt
        });

        return message.channel.send(`${Constants.Emojis.SUCCESS} | Subscription ${exists ? "updated" : "created"} for guild **${guildName}**. Get more informations with \`${message.guild.settings.prefix}sub ${guildID}\`.`);
    }
};
