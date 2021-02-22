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

    async run (message, args) {

        let guildID = args[0];
        if (!guildID) return message.error("Please specify a valid guild ID!");

        if (guildID.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-z]/)){
            const invite = await this.client.fetchInvite(guildID);
            guildID = invite.channel.guild.id;
        }

        const guildSubscriptions = await this.client.database.fetchGuildSubscriptions(guildID);
        const isPremium = guildSubscriptions.some((sub) => sub.expiresAt > Date.now());

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
            ? `This server is premium. Subscription will expire on ${this.client.functions.formatDate(new Date(guildSubscriptions.sort((a, b) => b.expiresAt - a.expiresAt)[0].expiresAt), "MMM DD YYYY", message.guild.settings.language)}.`
            : "This server is not premium.";

        const embed = new Discord.MessageEmbed()
            .setAuthor(`Subscription for ${guildData.name} (${guildID})`, guildData.icon)
            .setDescription(description)
            .setColor(this.client.config.color);

        for (const sub of guildSubscriptions){
            const aboutToExpire = sub.expiresAt < (Date.now() + 3 * 24 * 60 * 60 * 1000);
            const active = sub.expiresAt > Date.now();
            const invalidated = sub.cancelled;
            const payments = await this.client.database.fetchSubscriptionPayments(sub.id);
            const subContents = [''];
            payments.forEach((p) => {
                const currentContent = `\n__**${p.type}**__\nUser: **${p.payerDiscordUsername}** (\`${p.payerDiscordID}\`)\nDate: **${this.client.functions.formatDate(new Date(p.createdAt), "MMMM Do YYYY, h:mm:ss a", "en-US")}**\nID: ${p.id}`;
                if ((subContents[subContents.length - 1].length + currentContent.length) > 1024) subContents.push('');
                let previousContent = subContents.pop();
                subContents.push(previousContent + currentContent)
            });
            subContents.forEach((content) => {
                embed.addField(`${aboutToExpire ? this.client.config.emojis.idle : active ? this.client.config.emojis.online : this.client.config.emojis.dnd + (invalidated ? ` ${this.client.config.emojis.offline}` : "")} ${sub.subLabel} (${sub.id})`, content);
            });
        }

        message.channel.send(embed);

    }
};
