module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run () {

        this.client.user.setActivity("+help | manage-invite.xyz");

        if(!process.argv.includes("--uncache")) await this.client.wait(1000);
        let invites = {};
        let startAt = Date.now();
        this.client.fetching = true;

        await this.client.functions.asyncForEach(this.client.guilds.array(), async (guild) => {
            let i = process.argv.includes("--uncache") ? new Map() : (guild.me.hasPermission("MANAGE_GUILD") ? await guild.fetchInvites().catch(() => {}) : new Map());
            invites[guild.id] = i || new Map();
        });
        this.client.invitations = invites;
        this.client.fetched = true;
        this.client.fetching = false;
        if(this.client.shard.ids.includes(0)) console.log("=================================================");
        console.log(`\x1b[32m%s\x1b[0m`, `SHARD [${this.client.shard.ids[0]}]`, "\x1b[0m", `Invites fetched in ${Date.now() - startAt} ms.`);
        console.log("=================================================");
        if(this.client.shard.ids.includes(this.client.shard.count-1)){
            console.log("Ready. Logged as "+this.client.user.tag+". Some stats:\n");
            this.client.shard.broadcastEval(() => {
                console.log(`\x1b[32m%s\x1b[0m`, `SHARD [${this.shard.ids[0]}]`, "\x1b[0m", `Serving ${this.users.size} users in ${this.guilds.size} servers.`);
            });
            this.client.functions.postTopStats(this.client);
        }

        if(this.client.shard.ids.includes(0) && !this.client.spawned){
            this.client.dash.load(this.client);
        }
        
        this.client.on("shardReady", (shardID) => {
            this.client.shard.broadcastEval(`
                let logsChannel = this.channels.get(this.config.shardLogs);
                let emojis = this.config.emojis;
                if(logsChannel) logsChannel.send(emojis.dnd+' | Shard #${shardID} is ready!');
            `);
        });
        this.client.on("shardDisconnect", (shardID) => {
            this.client.shard.broadcastEval(`
                let logsChannel = this.channels.get(this.config.shardLogs);
                let emojis = this.config.emojis;
                if(logsChannel) logsChannel.send(emojis.offline+' | Shard #${shardID} is disconnected...');
            `);
        });
        this.client.on("shardReconnecting", (shardID) => {
            this.client.shard.broadcastEval(`
                let logsChannel = this.channels.get(this.config.shardLogs);
                let emojis = this.config.emojis;
                if(logsChannel) logsChannel.send(emojis.idle+' | Shard #${shardID} is reconnecting...');
            `);
        });
        this.client.on("shardResume", (shardID) => {
            this.client.shard.broadcastEval(`
                let logsChannel = this.channels.get(this.config.shardLogs);
                let emojis = this.config.emojis;
                if(logsChannel) logsChannel.send(emojis.online+' | Shard #${shardID} has resumed!');
            `);
        });
    }
};

