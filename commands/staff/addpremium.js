const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");

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

    async run (message, args) {

        const premiumArgs = {
            guildID: args[0],
            daysCount: parseInt(args[1]),
            amount: parseInt(args[2]),
            user: message.mentions.users.first() || await this.client.users.fetch(args[3]).catch(() => {}),
            pmtType: args[4],
            guildsCount: parseInt(args[5]),
            label: args.slice(6).join(" ")
        };

        if (premiumArgs.guildID && premiumArgs.guildID.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-zA-Z\d]/)){
            const invite = await this.client.fetchInvite(premiumArgs.guildID);
            premiumArgs.guildID = invite.channel.guild.id;
        }

        let send = false;
        Object.keys(premiumArgs).forEach((key) => {
            if (premiumArgs[key] === undefined && !send){
                send = true;
                return message.channel.send(`${Constants.Emojis.ERROR} | Invalid args. ${Object.keys(premiumArgs).join(", ")}. Missing **${key}**.`);
            }
        });
        if (send) return;

        const createdAt = new Date();

        const subscription = await this.client.database.createGuildSubscription(premiumArgs.guildID, {
            expiresAt: new Date(Date.now()+(premiumArgs.daysCount*24*60*60*1000)),
            createdAt,
            guildsCount: premiumArgs.guildsCount,
            subLabel: premiumArgs.label
        });

        await this.client.database.createSubscriptionPayment(subscription.id, {
            modDiscordID: message.author.id,
            payerDiscordID: premiumArgs.user.id,
            payerDiscordUsername: premiumArgs.user.tag,
            modID: message.author.id,
            amount: premiumArgs.amount,
            type: premiumArgs.pmtType,
            createdAt
        });

        return message.channel.send(`${Constants.Emojis.SUCCESS} | Subscription created. Get more informations with \`${message.guild.settings.prefix}sub ${premiumArgs.guildID}\`.`);

    }
};
