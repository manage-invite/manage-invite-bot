const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "addpremium",
            enabled: true,
            aliases: [ "add-premium" ],
            clientPermissions: [],
            permLevel: 5,

            slashCommandOptions: {
                permissions: [
                    {
                        id: "638688050289049600",
                        type: 1,
                        permission: true
                    }
                ],
                description: "Add premium to a guild",
                options: [
                    {
                        name: "guildid",
                        description: "The guild ID",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true
                    },
                    {
                        name: "dayscount",
                        description: "The number of days",
                        type: ApplicationCommandOptionTypes.INTEGER,
                        required: true
                    },
                    {
                        name: "amount",
                        description: "The amount of the payment (can be 0)",
                        type: ApplicationCommandOptionTypes.INTEGER,
                        required: true
                    },
                    {
                        name: "user",
                        description: "The user who requested the premium",
                        type: ApplicationCommandOptionTypes.USER,
                        required: true
                    },
                    {
                        name: "label",
                        description: "The label of the payment",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true
                    }
                ]
            }
        });
    }

    async runInteraction (interaction) {

        const premiumArgs = {
            guildID: interaction.options.getString("guildid"),
            daysCount: interaction.options.getInteger("dayscount"),
            amount: interaction.options.getInteger("amount"),
            user: interaction.options.getUser("user"),
            pmtType: "auto_add_cmd",
            guildsCount: 1,
            label: interaction.options.getString("label")
        };

        if (premiumArgs.guildID && premiumArgs.guildID.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-zA-Z\d]/)){
            const invite = await this.client.fetchInvite(premiumArgs.guildID);
            premiumArgs.guildID = invite.channel.guild.id;
        }

        let send = false;
        Object.keys(premiumArgs).forEach((key) => {
            if (premiumArgs[key] === undefined && !send){
                send = true;
                return interaction.reply(`${Constants.Emojis.ERROR} | Invalid args. ${Object.keys(premiumArgs).join(", ")}. Missing **${key}**.`);
            }
        });
        if (send) return;

        const createdAt = new Date();

        const subscription = await this.client.database.createGuildSubscription(premiumArgs.guildID, {
            expiresAt: new Date(Date.now()+(premiumArgs.daysCount*24*60*60*1000)),
            createdAt,
            guildsCount: premiumArgs.guildsCount,
            subLabel: premiumArgs.label
        });

        await this.client.database.createSubscriptionPayment(subscription.id, {
            modDiscordID: interaction.user.id,
            payerDiscordID: premiumArgs.user.id,
            payerDiscordUsername: premiumArgs.user.tag,
            modID: interaction.user.id,
            amount: premiumArgs.amount,
            type: premiumArgs.pmtType,
            createdAt
        });

        return interaction.reply(`${Constants.Emojis.SUCCESS} | Subscription created. Get more informations with \`/sub ${premiumArgs.guildID}\`.`);

    }
};
