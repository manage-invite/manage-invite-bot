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

        const force = message.content.includes('-f');

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
            if(!force) return message.error(`**${guildName}** has already used the trial period or has already paid.`);
        }

        const createdAt = new Date();

        const paymentID = await this.client.database.createPayment({
            payerDiscordID: user.id,
            payerDiscordUsername: user.tag,
            modID: message.author.id,
            amount: 0,
            type: "trial_activation",
            createdAt
        });

        const currentSubscription = message.guild.data.subscriptions.find((sub) => sub.label === "Trial Version");
        let subscription = currentSubscription || await this.client.database.createSubscription({
            expiresAt: new Date(Date.now()+(7*24*60*60*1000)),
            createdAt,
            guildsCount: 1,
            subLabel: "Trial Version"
        }, false);
        
        await this.client.database.createSubPaymentLink(subscription.id, paymentID);
        if(!message.guild.data.subscriptions.includes(subscription)){
            await this.client.database.createGuildSubLink(guildID, subscription.id);
        } else {
            await subscription.addDays(7);
        }
        await subscription.deleteGuildsFromCache();

        const expiresAt = this.client.functions.formatDate(new Date(subscription.expiresAt), "MMM DD YYYY", message.guild.data.language);
        message.channel.send(`${this.client.config.emojis.success} | Server **${guildName}** is now premium for 7 days (end on **${expiresAt}**) :rocket:`);

    }
};
