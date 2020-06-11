const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "start-trial",
            enabled: true,
            aliases: [ "starttrial" ],
            clientPermissions: [],
            permLevel: 4
        });
    }

    async run (message, args, data) {

        let guildID = args[0];
        if(!guildID) return message.error("Please specify a valid guild!");

        if(guildID.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-z]/)){
            let invite = await this.client.fetchInvite(guildID);
            guildID = invite.channel.guild.id;
        }

        if(!args[1]) return message.error("Please specify a valid user!");
        const user = message.mentions.users.first() || await this.client.users.fetch(args[1]) || message.guild.members.cache.find((m) => `${m.user.username}#${m.user.discriminator}` === args[1])?.user;
        if(!user) return message.error(`I wasn't able to find a user for \`${args[1]}\``);

        const guildData = await this.client.database.fetchGuild(guildID);
        const guildNames = await this.client.shard.broadcastEval(`
            let guild = this.guilds.cache.get('${guildID}');
            if(guild) guild.name;
        `);
        const guildNameFound = guildNames.find((r) => r);
        const guildName = guildNameFound || guildID;

        if(guildData.trialPeriodUsed){
            return message.error(`**${guildName}** has already used the trial period or has already paid.`);
        }

        const paymentID = await this.client.database.createPayment({
            payerDiscordID: user.id,
            payerDiscordUsername: user.tag,
            amount: 0,
            type: "trial_activation",
            createdAt: new Date()
        });

        const subscription = await this.client.database.createSubscription({
            expiresAt: new Date(Date.now()+(7*24*60*60*1000)),
            createdAt: new Date(),
            guildsCount: 1,
            subLabel: "trial_version"
        }, false);
        await this.client.database.createSubPaymentLink(subscription.id, paymentID);
        await this.client.database.createGuildSubLink(guildID, subscription.id);
        await subscription.fetchGuilds();

        const expiresAt = this.client.functions.formatDate(new Date(guildData.premiumExpiresAt), "MMM DD YYYY", message.guild.data.language);
        message.success(`Server **${guildName}** is now premium for 7 days (end on **${expiresAt}**) :rocket:`);

    }
};
