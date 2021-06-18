const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");

const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const width = 800;
const height = 300;
// White color and bold font
const ticksOptions = [{ ticks: { fontColor: "white", fontStyle: "bold" } }];
const options = {
    // Hide legend
    legend: { display: false },
    scales: { yAxes: ticksOptions, xAxes: ticksOptions }
};

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "stats",
            enabled: true,
            aliases: [ "joins" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0,
            cooldown: (message, args) => parseInt(!isNaN(args[0]) ? ((parseInt(args[0]) >= 1000 ? 1000 : parseInt(args[0])) / 100) : 0)
        });
    }

    async run (message, args, data) {

        const embed = new Discord.MessageEmbed()
            .setColor(data.color)
            .setFooter(data.footer);

        let numberOfDays = args[0] || 7;
        if (isNaN(numberOfDays)) return message.error("core/stats:INVALID");
        numberOfDays = parseInt(numberOfDays);
        if (numberOfDays <= 1 || numberOfDays > 1000) return message.error("core/stats:INVALID");

        await message.guild.members.fetch();
        const joinedXDays = this.client.functions.joinedXDays(numberOfDays, message.guild.members.cache);
        const lastXDays = this.client.functions.lastXDays(numberOfDays, message.translate("core/stats:months", {
            returnObjects: true
        }));

        embed.setAuthor(message.translate("core/stats:TITLE", {
            server: message.guild.name,
            days: numberOfDays
        }));
        const canvasRenderService = new ChartJSNodeCanvas({ width, height });
        const image = await canvasRenderService.renderToBuffer({
            type: "line",
            data: {
                labels: lastXDays,
                datasets: [
                    {
                        data: joinedXDays,
                        // The color of the line (the same as the fill color with full opacity)
                        borderColor: "rgb(61,148,192)",
                        // Fill the line with color
                        fill: true,
                        // Blue color and low opacity
                        backgroundColor: "rgba(61,148,192,0.1)"
                    }
                ]
            },
            options
        });
        const attachment = new Discord.MessageAttachment(image, "image.png");
        embed.setImage("attachment://image.png");
        const total = joinedXDays.reduce((p, c) => p+c);
        const percent = Math.round((100*total)/message.guild.members.cache.size);
        const daysRange = [lastXDays.shift(), lastXDays.pop()];
        embed.addField("\u200B", message.translate("core/stats:CONTENT", {
            total,
            percent,
            from: daysRange[0],
            to: daysRange[1]
        }));
        message.channel.send({
            embeds: [embed],
            files: [attachment]
        });

    }
};
