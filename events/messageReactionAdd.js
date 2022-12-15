const Discord = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (reaction, user) {

        const message = await reaction.message.channel.messages.fetch(reaction.message.id);

        const embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: `${user.tag} answered satisfaction form`,
                iconURL: user.displayAvatarURL()
            })
            .setFooter({
                text: `Form ID: ${message.id}`
            })
            .setColor("#4682B4");

        let reason = "Unknown emoji";

        if (reaction.message.channel.type === "DM"){

            if (user.id === this.client.user.id) return;
            if (reaction.message.author.id !== this.client.user.id) return;
            if (reaction.message.content.includes("No feedback received from yourself for 24 hours, form cancelled.")) return;
            if (reaction.message.content.includes("Thank you for your feedback!")) return;
            if (reaction.message.content.includes("Can you specify ")) return;

            switch (reaction.emoji.name) {
            case "\u0031\u20E3":
                reason = message.content.split(":one:")[1].split("\n")[0];
                break;
            case "\u0032\u20E3":
                reason = message.content.split(":two:")[1].split("\n")[0];
                break;
            case "\u0033\u20E3":
                reason = message.content.split(":three:")[1].split("\n")[0];
                break;
            case "\u0034\u20E3":
                reason = message.content.split(":four:")[1].split("\n")[0];
                break;
            default:
                return;
            }

            if (reason.trim() === "Other"){
                await message.reactions.cache.each(r => r.users.remove(this.client.user.id));
                await message.edit(message.content+"\nEnter the reason below (send a message):");
                const waitingAnswerEmbed = escape(JSON.stringify(new Discord.EmbedBuilder()
                    .setAuthor({
                        name: `Awaiting other feedback from ${user.tag}`,
                        iconURL: user.displayAvatarURL()
                    })
                    .setFooter({
                        text: `Form ID: ${message.id}`
                    })
                    .setColor("#B0E0E6")));
                this.client.shard.broadcastEval((client, waitingAnswerEmbed) => {
                    const aLogs = client.channels.cache.get(client.config.premiumLogs);
                    if (aLogs) aLogs.send({ embeds: [waitingAnswerEmbed] });
                }, { context: waitingAnswerEmbed });
                const collected = await message.channel.awaitMessages({ filter: () => true, max: 1, time: 24*60*60*1000, errors: ["time"] })
                    .catch(async () => {
                        const noAnswerEmbed = new Discord.EmbedBuilder()
                            .setAuthor({
                                name: `No feedback received for other from ${user.tag}`,
                                iconURL: user.displayAvatarURL()
                            })
                            .setFooter({
                                text: `Form ID: ${message.id}`
                            })
                            .setColor("#ADD8E6");
                        this.client.shard.broadcastEval((client, noAnswerEmbed) => {
                            const aLogs = client.channels.cache.get(client.config.premiumLogs);
                            if (aLogs) aLogs.send({ embeds: [noAnswerEmbed] });
                        }, { context: noAnswerEmbed });
                        await message.edit((message.content.replace("Enter the reason below (send a message):", ""))+"No feedback received from yourself for 24 hours, form cancelled.");
                    });
                if (!collected) return;
                reason = collected.first().content;
            }

            await message.reactions.cache.each(r => r.users.remove(this.client.user.id));
            message.edit((message.content.replace("Enter the reason below (send a message):", ""))+"\nThank you for your feedback!");

            embed.setDescription(reason);
            // to-do: find a better way to prevent \n and \r from being replaced

            this.client.shard.broadcastEval((client, logEmbed) => {
                const aLogs = client.channels.cache.get(client.config.premiumLogs);
                if (aLogs) aLogs.send({ embeds: [logEmbed] });
            }, { context: embed });
        }
        
    }
};
