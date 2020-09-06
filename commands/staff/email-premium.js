const Command = require("../../structures/Command.js");

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

        const guildData = await this.client.database.fetchGuild(guildID);
        const guildNames = await this.client.shard.broadcastEval(`
            let guild = this.guilds.cache.get('${guildID}');
            if(guild) guild.name;
        `);
        const guildNameFound = guildNames.find((r) => r);
        const guildName = guildNameFound || guildID;

        const createdAt = new Date();

        const paymentID = await this.client.database.createPayment({
            modDiscordID: message.author.id,
            payerDiscordID: user.id,
            payerDiscordUsername: user.tag,
            transactionID,
            modID: message.author.id,
            amount: isMonth ? 2 : 18,
            type: "email_address_pmnt_"+(isMonth ? "month" : "year"),
            createdAt
        });

        const currentSubscription = guildData.subscriptions.find((sub) => sub.label === "Premium "+(isMonth ? "Monthly" : "Yearly")+" 1 Guild");
        const subscription = currentSubscription || await this.client.database.createSubscription({
            expiresAt: new Date(Date.now()+((isMonth ? 31 : 366)*24*60*60*1000)),
            createdAt,
            guildsCount: 1,
            subLabel: "Premium "+(isMonth ? "Monthly" : "Yearly")+" 1 Guild"
        });
        const exists = guildData.subscriptions.includes(subscription);
        
        await this.client.database.createSubPaymentLink(subscription.id, paymentID);
        if (!exists){
            await this.client.database.createGuildSubLink(guildID, subscription.id);
        } else {
            await subscription.addDays(isMonth ? 31 : 366);
        }
        await subscription.deleteGuildsFromCache();

        return message.channel.send(`${this.client.config.emojis.success} | Subscription ${exists ? "updated" : "created"} for guild **${guildName}**. Get more informations with \`${message.guild.data.prefix}sub ${guildID}\`.`);
    }
};
