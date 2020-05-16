const Command = require("../../structures/Command.js");
const date = require('date-and-time');
require('date-and-time/locale/fr');

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
        guildData.addPremiumDays(parseInt(numberOfDays), "addpremium cmd", message.guild.id);

        if(guildData.language === "fr-FR"){
            date.locale("fr");
        } else {
            date.locale("en");
        }

        message.success("staff/addpremium:ADDED", {
            guild: guildName,
            days: parseInt(numberOfDays),
            expiresAt: date.format(new Date(guildData.premiumExpiresAt), "MMM DD YYYY")
        });

    }
};
