const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

class RemoveInvites extends Command {
    constructor (client) {
        super(client, {
            name: "removeinvites",
            enabled: true,
            aliases: [ "rinvites", "removeinv", "rinv", "removeinvite", "remove-invites", "remove-invite" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        
        let member = args[0] ? await this.client.resolveMember(args.join(" "), message.guild) : null;
        let msg = await (member ? message.channel.send(message.language.removeinvites.loading.member(data.guild.prefix, member)) : message.channel.send(message.language.removeinvites.loading.all(data.guild.prefix)));
        if(member){
            let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id });
            // Save invites
            memberData.old_invites = memberData.invites;
            // Then delete them
            memberData.invites = 0;
            // Save fake
            memberData.old_fake = memberData.fake;
            // Then delete them
            memberData.fake = 0;
            // Save leaves
            memberData.old_leaves = memberData.leaves;
            // Then delete them
            memberData.leaves = 0;
            // Save bonus
            memberData.old_bonus = memberData.bonus;
            // Then delete them
            memberData.bonus = 0;
            // Save the member
            await memberData.save();
        } else {
            // Find all members in the guild
            let members = await this.client.guildMembersData.find({ guildID: message.guild.id });
            await this.client.functions.asyncForEach(members, async (memberData) => {
                // Save invites
                memberData.old_invites = memberData.invites;
                // Then delete them
                memberData.invites = 0;
                // Save fake
                memberData.old_fake = memberData.fake;
                // Then delete them
                memberData.fake = 0;
                // Save leaves
                memberData.old_leaves = memberData.leaves;
                // Then delete them
                memberData.leaves = 0;
                // Save bonus
                memberData.old_bonus = memberData.bonus;
                // Then delete them
                memberData.bonus = 0;
                // Save the member
                await memberData.save();
            });
        }

        let embed = new Discord.MessageEmbed()
        .setAuthor(message.language.removeinvites.title())
        .setDescription((member ?
            message.language.removeinvites.titles.member(data.guild.prefix, member)
            : message.language.removeinvites.titles.all(data.guild.prefix)
        ))
        .setColor(data.color)
        .setFooter(data.footer);

        msg.edit(null, { embed });

    }

};

module.exports = RemoveInvites;