const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

const { CanvasRenderService } = require("chartjs-node-canvas");
const width = 800;
const height = 300;
// White color and bold font
const ticksOptions = [{ ticks: { fontColor: "white", fontStyle: "bold" } }];
const options = {
    // Hide legend
    legend: { display: false },
    scales: { yAxes: ticksOptions, xAxes: ticksOptions }
};

class Stats extends Command {
    constructor (client) {
        super(client, {
            name: "stats",
            enabled: true,
            aliases: [ "joins" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
        let type = args[0];

        let embed = new Discord.MessageEmbed()
        .setColor(data.color)
        .setFooter(data.footer);

        let numberOfDays = args[0] || 7;
        if(isNaN(numberOfDays)) return message.channel.send(message.language.stats.errors.invalid());
        numberOfDays = parseInt(numberOfDays);
        if(numberOfDays !== 7 && !data.guild.premium){
            return message.channel.send(message.language.stats.premium(message.author.username));
        }
        if(numberOfDays <= 1 || numberOfDays > 1000) return message.channel.send(message.language.stats.errors.invalid());

        let guild = await message.guild.fetch();
        let joinedXDays = this.client.functions.joinedXDays(numberOfDays, guild.members);
        let lastXDays = this.client.functions.lastXDays(numberOfDays, message.language.monthIndex);

        embed.setAuthor(message.language.stats.title(message.guild.name, numberOfDays));
        const canvasRenderService = new CanvasRenderService(width, height, (ChartJS) => {});
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
        embed.attachFiles(attachment);
        embed.setImage("attachment://image.png");
        let total = joinedXDays.reduce((p, c) => p+c);
        let percent = Math.round((100*total)/guild.members.cache.size);
        let daysRange = [lastXDays.shift(), lastXDays.pop()];
        embed.addField("\u200B", message.language.stats.content(total, percent, daysRange));
        message.channel.send(embed);

    }
}

module.exports = Stats;