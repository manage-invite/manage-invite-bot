const Command = require("../../structures/Command.js"),
    Discord = require("discord.js"),
    Constants = require("../helpers/constants");

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

    async run (message, args) {

        let guildID = args[0];
        if (!guildID) return message.error("Please specify a valid guild ID!");

        if (guildID.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-z]/)){
            const invite = await this.client.fetchInvite(guildID);
            guildID = invite.channel.guild.id;
        }

        const guildSubscriptions = await this.client.database.fetchGuildSubscriptions(guildID);
        const isPremium = guildSubscriptions.some((sub) => new Date(sub.expiresAt).getTime() > Date.now());

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
        };

        const description = isPremium
            ? `This server is premium. Subscription will expire on ${this.client.functions.formatDate(new Date(guildSubscriptions.sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())[0].expiresAt), "MMM DD YYYY", message.guild.settings.language)}.`
            : "This server is not premium.";

        const embed = new Discord.MessageEmbed()
            .setAuthor(`Subscription for ${guildData.name} (${guildID})`, guildData.icon)
            .setDescription(description)
            .setColor(this.client.config.color);

        for (const sub of guildSubscriptions){
            const active = new Date(sub.expiresAt).getTime() > Date.now();
            const aboutToExpire = active && new Date(sub.expiresAt).getTime() < (Date.now() + 3 * 24 * 60 * 60 * 1000);
            const invalidated = sub.subInvalidated;
            const payments = await this.client.database.fetchSubscriptionPayments(sub.id);
            const subContents = [""];
            payments.forEach((p) => {
                const currentContent = `\n__**${p.type}**__\nUser: **${p.payerDiscordUsername}** (\`${p.payerDiscordID}\`)\nDate: **${this.client.functions.formatDate(new Date(p.createdAt), "MMMM Do YYYY, h:mm:ss a", "en-US")}**\nID: ${p.id}`;
                if ((subContents[subContents.length - 1].length + currentContent.length) > 1024) subContents.push("");
                const previousContent = subContents.pop();
                subContents.push(previousContent + currentContent);
            });
            subContents.forEach((content) => {
                embed.addField(`${aboutToExpire ? Constants.Emojis.IDLE : active ? Constants.Emojis.ONLINE : Constants.Emojis.DND + (invalidated ? ` ${Constants.Emojis.OFFLINE}` : "")} ${sub.subLabel} (${sub.id})`, content);
            });
        }

        message.channel.send(embed);

    }
};
