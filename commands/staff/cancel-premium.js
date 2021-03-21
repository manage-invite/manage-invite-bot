const Command = require("../../structures/Command.js");
const Constants = require("../helpers/constants");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "cancel-premium",
            enabled: true,
            aliases: [ "cancelpremium" ],
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
        
        const guildData = await this.client.database.fetchGuild(guildID);
        const guildNames = await this.client.shard.broadcastEval(`
            let guild = this.guilds.cache.get('${guildID}');
            if(guild) guild.name;
        `);
        const guildNameFound = guildNames.find((r) => r);
        const guildName = guildNameFound || guildID;

        const subscriptionID = parseInt(args[1]);
        const subscription = guildData.subscriptions.find((sub) => sub.id === subscriptionID);

        if (!subscription) return message.error("No sub ID found for that query!");

        await subscription.invalidate();

        return message.channel.send(`${Constants.Emojis.SUCCESS} | Subscription invalidated for guild **${guildName}**. Get more informations with \`${message.guild.data.prefix}sub ${guildID}\`.`);
    }
};
