const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class Blacklist extends Command {
    constructor (client) {
        super(client, {
            name: "blacklist",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        const embed = new Discord.MessageEmbed()
        .setColor(data.color)
        .setFooter(data.footer);
        const action = args[0];
        switch(action){
            case "add": {
                const user = message.mentions.users.first() || await this.client.users.fetch(args[1]).catch(() => {});
                if(!user) return message.channel.send(message.language.blacklist.mentions.add());
                await data.guild.addUserBlacklist(user.id);
                message.channel.send(message.language.blacklist.success.add(user));
                break;
            };
            case "remove": {
                const user = message.mentions.users.first() || await this.client.users.fetch(args[1]).catch(() => {});
                if(!user) return message.channel.send(message.language.blacklist.mentions.remove());
                if(!data.guild.blacklistedUsers.includes(user.id)) return message.channel.send(message.language.blacklist.notFound(user));
                await data.guild.removeUserBlacklist(user.id);
                message.channel.send(message.language.blacklist.success.remove(user));
                break;
            }
            case "list": {
                if(data.guild.blacklistedUsers.length < 1){
                    embed.setDescription(message.language.blacklist.empty());
                } else {
                    let users = [];
                    await this.client.functions.asyncForEach(data.guild.blacklistedUsers, async (userID) => {
                        const user = await this.client.users.fetch(userID);
                        users.push(`${user.tag} (${user.toString()})`);
                    });
                    embed.setDescription(users.join("\n"));
                }
                message.channel.send(embed);
                break;
            }
            default: {
                message.channel.send(message.language.blacklist.action.error());
            }
        }
    }

};

module.exports = Blacklist;