const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");
const Discord = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "start-trial",
            enabled: true,
            clientPermissions: [],
            permLevel: 4,

            slashCommandOptions: {
                description: "Start a trial for a user",
                options: [
                    {
                        name: "guild",
                        description: "The guild ID",
                        type: Discord.ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "user",
                        description: "The user who requested the premium",
                        type: Discord.ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        name: "duration",
                        description: "The duration of the trial in days (default: 7)",
                        type: Discord.ApplicationCommandOptionType.Integer,
                        required: false,
                    }
                ],
                permissions: [
                    {
                        id: "638688050289049600",
                        type: 1,
                        permission: true
                    }
                ]
            }
        });
    }

    async runInteraction (interaction, data) {

        let guildID = interaction.options.getString("guild");

        if (guildID.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-zA-Z\d]/)){
            const invite = await this.client.fetchInvite(guildID);
            guildID = invite.channel.guild.id;
        }

        const user = interaction.options.getUser("user");
        const duration = interaction.options.getInteger("duration (days)") || 7;

        const guildSubscriptions = await this.client.database.fetchGuildSubscriptions(guildID);
        const guildNames = await this.client.shard.broadcastEval((client, guildID) => {
            const guild = client.guilds.cache.get(guildID);
            if (guild) return guild.name;
        }, { context: guildID });
        const guildNameFound = guildNames.find((r) => r);
        const guildName = guildNameFound || guildID;

        if (guildSubscriptions.length > 0){
            return interaction.reply(`**${guildName}** has already used the trial period or has already paid.`);
        }

        const createdAt = new Date();

        const currentSubscription = guildSubscriptions.find((sub) => sub.subLabel === "Trial Version");
        let subscription = currentSubscription;

        if (!subscription) {
            subscription = await this.client.database.createGuildSubscription(guildID, {
                expiresAt: new Date(Date.now()+(duration*24*60*60*1000)),
                createdAt,
                guildsCount: 1,
                subLabel: "Trial Version"
            });
        } else await this.client.database.updateGuildSubscription(subscription.id, guildID, "expiresAt",
            new Date((new Date(subscription.expiresAt).getTime() > Date.now() ? new Date(subscription.expiresAt).getTime() : Date.now()) + duration * 24 * 60 * 60 * 1000).toISOString()
        );

        await this.client.database.createSubscriptionPayment(subscription.id, {
            modDiscordID: interaction.user.id,
            payerDiscordID: user.id,
            payerDiscordUsername: user.tag,
            modID: interaction.user.id,
            amount: 0,
            type: "trial_activation",
            createdAt
        });

        const expiresAt = this.client.functions.formatDate(new Date(subscription.expiresAt), "MMM DD YYYY", data.settings.language);
        interaction.reply(`${Constants.Emojis.SUCCESS} | Server **${guildName}** is now premium for ${duration} days (end on **${expiresAt}**) :rocket:`);

    }
};
