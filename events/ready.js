const CronJob = require("cron").CronJob;
const Discord = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run () {

        this.client.user.setActivity("+help | manage-invite.xyz");
        setInterval(() => {
            this.client.user.setActivity("+help | manage-invite.xyz");
        }, 60000*60);
        this.client.logger.log("Shard #"+this.client.shard.ids[0]+" has started.", "log");
        this.client.functions.postTopStats(this.client);

        if (!process.argv.includes("--uncache")) await this.client.wait(1000);
        const invites = {};
        const startAt = Date.now();
        this.client.fetching = true;

        const premiumGuildsID = await this.client.database.fetchPremiumGuilds();
        this.client.logger.log(`Shard #${this.client.shard.ids[0]} launched (${this.client.pgQueries} queries)`);
        this.client.logger.log(`Subscriptions: ${this.client.database.subscriptionCache.size}`);
        this.client.logger.log(`Guilds: ${this.client.database.guildCache.size}`);
        await this.client.functions.asyncForEach(this.client.guilds.cache.array(), async (guild) => {
            if (premiumGuildsID.includes(guild.id)){
                const member = await guild.members.fetch(this.client.user.id).catch(() => {});
                const i = process.argv.includes("--uncache") ? null : (member.hasPermission("MANAGE_GUILD") ? await guild.fetchInvites().catch(() => {}) : null);
                invites[guild.id] = i || null;
            }
        });
        this.client.invitations = invites;
        this.client.fetched = true;
        this.client.fetching = false;
        if (this.client.shard.ids.includes(0)) console.log("=================================================");
        console.log("\x1b[32m%s\x1b[0m", `SHARD [${this.client.shard.ids[0]}]`, "\x1b[0m", `Invites fetched in ${Date.now() - startAt} ms.`);
        console.log("=================================================");
        if (this.client.shard.ids.includes(this.client.shard.count-1)){
            console.log("Ready. Logged as "+this.client.user.tag+". Some stats:\n");
            this.client.shard.broadcastEval(() => {
                console.log("\x1b[32m%s\x1b[0m", `SHARD [${this.shard.ids[0]}]`, "\x1b[0m", `Serving ${this.users.cache.size} users in ${this.guilds.cache.size} servers.`);
            });
        }

        if (this.client.shard.ids.includes(0) && !this.client.spawned){
            this.client.dash.load(this.client);
            //new CronJob("0 0 0 * * *", async () => {
            // tous les abonnements qui ont expiré il y a trois jours au moins
            this.client.database.query(`
                SELECT distinct on (s.id) s.id as sub_id, p.id as payment_id, p.type, gs.guild_id, p.payer_discord_id, p.payer_discord_username, s.sub_label, s.expires_at, p.details FROM guilds_subscriptions gs
                INNER JOIN subscriptions s ON s.id = gs.sub_id
                INNER JOIN subscriptions_payments sp ON sp.sub_id = s.id
                INNER JOIN payments p ON p.id = sp.payment_id
                AND s.expires_at < now() - interval '3 days'
                AND s.expires_at > now() - interval '10 days'
                AND gs.guild_id NOT IN (
                    SELECT guild_id FROM guilds_subscriptions gs
                    INNER JOIN subscriptions s ON gs.sub_id = s.id
                    WHERE s.expires_at >= now()
                )
                ORDER BY s.id, p.created_at;
            `).then(async ({ rows }) => {
                const { rows: paymentsReminds  } = await this.client.database.query(`
                    SELECT * FROM payments_reminds
                `);
                rows = rows.filter((r) => !paymentsReminds.some((pr) => pr.sub_id === r.sub_id && pr.last_payment_id === r.payment_id));
                console.log(`Envoi de ${rows.length} notifications`);
                rows.forEach(async (row) => {
                    const user = await this.client.users.fetch("422820341791064085");
                    const guildNames = await this.client.shard.broadcastEval(`
                        let guild = this.guilds.cache.get('${row.guild_id}');
                        if(guild) guild.name;
                    `);
                    const guildNameFound = guildNames.find((r) => r);
                    if (!guildNameFound) {
                        return this.client.database.query(`
                            INSERT INTO payments_reminds
                            (last_payment_id, sub_id, success_sent, bot_kicked) VALUES
                            ('${row.payment_id}', '${row.sub_id}', false, true)
                        `);
                    }
                    const beg = row.sub_label === "Trial Version" ? "Your trial period" : "Your premium subscription";
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(`Hello, ${user.username}`)
                        .setDescription(`${beg} for **${guildNameFound}** expires in 72 hours! Click [here](https://dash.manage-invite.xyz/manage/${row.guild_id}/createsub) to continue to use the bot, the price is $2 per month.`)
                        .setColor(this.client.config.color)
                        .setFooter(this.client.config.footer);
                    const send = () => new Promise((resolve) => user.send(embed).then(resolve(true)).catch(resolve(false)));
                    this.client.database.query(`
                        INSERT INTO payments_reminds
                        (last_payment_id, sub_id, success_sent, bot_kicked) VALUES
                        ('${row.payment_id}', '${row.sub_id}', ${await send()}, false)
                    `);
                });
            });
            //});
            new CronJob("0 */15 * * * *", async () => {
                const results = await this.client.shard.broadcastEval(() => {
                    const commandsRan = this.commandsRan;
                    const pgQueries = this.pgQueries;
                    const guildsCreated = this.guildsCreated;
                    const guildsDeleted = this.guildsDeleted;
                    this.commandsRan = 0;
                    this.pgQueries = 0;
                    this.guildsCreated = 0;
                    this.guildsDeleted = 0;
                    return [
                        commandsRan,
                        pgQueries,
                        guildsCreated,
                        guildsDeleted
                    ];
                });
                const totalCommandsRan = results.map((r) => r[0]).reduce((p, c) => p + c);
                const totalPgQueries = results.map((r) => r[1]).reduce((p, c) => p + c);
                const totalGuildsCreated = results.map((r) => r[2]).reduce((p, c) => p + c);
                const totalGuildsDeleted = results.map((r) => r[3]).reduce((p, c) => p + c);
                const content = `New servers: **${totalGuildsCreated}**\nLost servers: **${totalGuildsDeleted}**\nCommands ran: **${totalCommandsRan}**\nPG Queries: **${totalPgQueries}**`;
                this.client.shard.broadcastEval(`
                    let channel = this.channels.cache.get(this.config.statsLogs);
                    if(channel) channel.send(\`${content}\`);
                `);
                this.client.database.saveStats(totalGuildsCreated, totalGuildsDeleted, totalCommandsRan, totalPgQueries, new Date());
            }, null, true, "America/Los_Angeles");
        }

        new CronJob("0 */15 * * * *", async () => {
            if (this.client.fetched){
                const guildsToFetch = this.client.guilds.cache.filter((guild) => !this.client.invitations[guild.id]).array();
                this.client.logger.log(`${guildsToFetch.length} guilds need to be fetched`);
                await this.client.functions.asyncForEach(guildsToFetch, async (guild) => {
                    const member = await guild.members.fetch(this.client.user.id).catch(() => {});
                    const i = process.argv.includes("--uncache") ? null : (member.hasPermission("MANAGE_GUILD") ? await guild.fetchInvites().catch(() => {}) : null);
                    this.client.invitations[guild.id] = i || null;
                });
                this.client.fetched = true;
            }
        }, null, true, "America/Los_Angeles");

    }
};

