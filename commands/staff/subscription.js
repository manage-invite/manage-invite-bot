const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "subscription",
            enabled: true,
            aliases: [ "sub" ],
            clientPermissions: [],
            permLevel: 4
        });
    }

    async run (message, args, data) {

        const guildID = args[0];
        if(!guildID) return message.error("staff/addpremium:MISSING_GUILD_ID");

        const guildDB = await this.client.database.fetchGuild(guildID);
        const guildJsons = await this.client.shard.broadcastEval(`
            let guild = this.guilds.cache.get('${guildID}');
            if(guild){
                [ guild.name, guild.iconURL() ]
            }
        `);
        const guildJson = guildJsons.find((r) => r);
        const guildData = (guildJson ? { name: guildJson[0], icon: guildJson[1] } : null) || {
            name: "Unknown Name",
            icon: ""
        }

        const embed = new Discord.MessageEmbed()
        .setAuthor(`Subscription for ${guildData.name}`, guildData.icon)
        .setDescription(`__**Premium**__: ${guildDB.premium ? "Enabled" : "Disabled"}\n__**Trial period**__: ${guildDB.trialPeriodEnabled ? "Started" : guildDB.trialPeriodUsed ? "Expired" : "Not started"}`)
        .setColor(data.color)
        .setFooter(data.footer);

        const types = {
            "addpremium_cmd": "addpremium command",
            "addpremium_cmd_trial": "addpremium command (trial)",
            "sub_dash_paypal": "dashboard paypal"
        };

        const subscriptions = await this.client.database.fetchSubscriptions(guildID);
        if(subscriptions.length > 0){
            subscriptions.forEach(s => {
                embed.addField(this.client.functions.formatDate(new Date(s.sub_created_at), "MMM D YYYY h:m:s A", "en-US"), `__Type__: ${types[s.sub_type]} | __User ID__: ${s.sub_payer_id} ${message.guild.members.cache.has(s.sub_payer_id) ? `(<@${s.sub_payer_id}>)` : ""}`)    
            });
        } else {
            embed.addField("Payments", "No payment to display.");
        }

        message.channel.send(embed);

    }
};
