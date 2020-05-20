const Command = require("../../structures/Command.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "addpremium",
            enabled: true,
            aliases: [ "add-premium" ],
            clientPermissions: [],
            permLevel: 4
        });
    }

    async run (message, args, data) {

        const guildID = args[0];
        if(!guildID) return message.error("staff/addpremium:MISSING_GUILD_ID");

        const numberOfDays = args[1];
        if(!numberOfDays || isNaN(numberOfDays)) return message.error("staff/addpremium:MISSING_NUMBER_DAYS");

        const guildData = await this.client.database.fetchGuild(guildID);
        const guildNames = await this.client.shard.broadcastEval(`
            let guild = this.guilds.cache.get('${guildID}');
            if(guild) guild.name;
        `);
        const guildNameFound = guildNames.find((r) => r);
        const guildName = guildNameFound || guildID;
        if(!message.content.includes("no-trial")){
            await guildData.addPremiumDays(parseInt(numberOfDays), "addpremium_cmd", message.author.id);
            await guildData.setTrialPeriodEnabled(true);
        } else {
            await guildData.addPremiumDays(parseInt(numberOfDays), "addpremium_cmd_trial", message.author.id);
            await guildData.setTrialPeriodEnabled(false);
            await guildData.setTrialPeriodUsed(true);
        }

        message.success("staff/addpremium:ADDED", {
            guild: guildName,
            days: parseInt(numberOfDays),
            expiresAt: this.client.functions.formatDate(new Date(guildData.premiumExpiresAt), "MMM DD YYYY", message.guild.data.language)
        });

    }
};
