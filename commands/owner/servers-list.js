const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class ServersList extends Command {

    constructor (client) {
        super(client, {
            name: "servers-list",
            enabled: true,
            aliases: [ "sl" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 4
        });
    }

    async run (message, args, data) {
        
        await message.delete();

        let i0 = 0;
        let i1 = 10;
        let page = 1;

        let results = await this.client.shard.broadcastEval(() => {
            return this.guilds.cache.array();
        });
        let guilds = [];
        results.forEach((a) => guilds = [...guilds, ...a]);

        let description = 
        `Total servers: ${guilds.length}\n\n`+
        guilds.sort((a,b) => b.memberCount-a.memberCount).map((r) => r)
        .map((r, i) => `**${i + 1}** - ${r.name} | ${r.memberCount} members`)
        .slice(0, 10)
        .join("\n");

        let embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setColor(data.color)
            .setFooter(message.client.user.username)
            .setTitle(`Page: ${page}/${Math.ceil(guilds.length/10)}`)
            .setDescription(description);

        let msg = await message.channel.send(embed);
        
        await msg.react("⬅");
        await msg.react("➡");
        await msg.react("❌");

        let collector = msg.createReactionCollector((reaction, user) => user.id === message.author.id);

        collector.on("collect", async(reaction, user) => {

            if(reaction._emoji.name === "⬅") {

                // Updates variables
                i0 = i0-10;
                i1 = i1-10;
                page = page-1;
                
                // if there is no guild to display, delete the message
                if(i0 < 0){
                    return msg.delete();
                }
                if(!i0 || !i1){
                    return msg.delete();
                }
                
                description = `Total servers: ${guilds.length}\n\n`+
                guilds.sort((a,b) => b.memberCount-a.memberCount).map((r) => r)
                .map((r, i) => `**${i + 1}** - ${r.name} | ${r.memberCount} members`)
                .slice(i0, i1)
                .join("\n");

                // Update the embed with new informations
                embed.setTitle(`Page: ${page}/${Math.round(guilds.length/10)}`)
                .setDescription(description);
            
                // Edit the message 
                msg.edit(embed);
            
            };

            if(reaction._emoji.name === "➡"){

                // Updates variables
                i0 = i0+10;
                i1 = i1+10;
                page = page+1;

                // if there is no guild to display, delete the message
                if(i1 > guilds.length + 10){
                    return msg.delete();
                }
                if(!i0 || !i1){
                    return msg.delete();
                }

                description = `Total servers: ${guilds.length}\n\n`+
                guilds.sort((a,b) => b.memberCount-a.memberCount).map((r) => r)
                .map((r, i) => `**${i + 1}** - ${r.name} | ${r.memberCount} members`)
                .slice(i0, i1)
                .join("\n");

                // Update the embed with new informations
                embed.setTitle(`Page: ${page}/${Math.round(guilds.length/10)}`)
                .setDescription(description);
            
                // Edit the message 
                msg.edit(embed);

            };

            if(reaction._emoji.name === "❌"){
                return msg.delete(); 
            }

            // Remove the reaction when the user react to the message
            await reaction.users.remove(message.author.id);

        });
    }

}

module.exports = ServersList;