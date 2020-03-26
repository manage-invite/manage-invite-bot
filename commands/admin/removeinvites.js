const Command = require("../../structures/Command.js"),
Discord = require("discord.js");

module.exports = class extends Command {
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
        
        const member = args[0] ? await this.client.resolveMember(args.join(" "), message.guild) : null;
        const msg = await (member ? message.sendT("admin/removeinvites:LOADING_MEMBER", {
            username: member.user.tag,
            loading: this.client.config.emojis.loading,
            prefix: data.guild.prefix
        }) : message.sendT("admin/removeinvites:LOADING", {
            loading: this.client.config.emojis.loading,
            prefix: data.guild.prefix
        }));
        if(member){
            const memberData = await this.client.database.fetchMember(member.id, message.guild.id);
            memberData.oldRegular = memberData.regular;
            memberData.regular = 0;
            memberData.oldFake = memberData.fake;
            memberData.fake = 0;
            memberData.oldLeaves = memberData.leaves;
            memberData.leaves = 0;
            memberData.oldBonus = memberData.bonus;
            memberData.bonus = 0;
            await memberData.updateInvites();
        } else {
            message.react(Discord.Util.parseEmoji(this.client.config.emojis.loading).id);
            // Find all members in the guild
            const members = await this.client.database.fetchMembers(message.guild.id, false);
            await this.client.functions.asyncForEach(members, async (memberData) => {
                memberData.oldRegular = memberData.regular;
                memberData.regular = 0;
                memberData.oldFake = memberData.fake;
                memberData.fake = 0;
                memberData.oldLeaves = memberData.leaves;
                memberData.leaves = 0;
                memberData.oldBonus = memberData.bonus;
                memberData.bonus = 0;
                await memberData.updateInvites();
            });
        }

        const embed = new Discord.MessageEmbed()
        .setAuthor(message.translate("admin/removeinvites:TITLE"))
        .setDescription((member ?
            message.translate("admin/removeinvites:DESCRIPTION_MEMBER", {
                username: member.user.tag,
                success: this.client.config.emojis.success
            })
            : message.translate("admin/removeinvites:DESCRIPTION", {
                success: this.client.config.emojis.success
            })
        ))
        .setColor(data.color)
        .setFooter(data.footer);

        msg.edit(null, { embed });

    }

};
