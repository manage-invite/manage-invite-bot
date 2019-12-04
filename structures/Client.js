const { Client, Collection } = require("discord.js"),
TOP = require("dblapi.js"),
util = require("util"),
path = require("path");

// Creates ManageInvite class
class ManageInvite extends Client {

    constructor (options) {
        super(options);
        // Config
        this.config = require("../config"); // Load the config file
        this.permLevels = require("../helpers/permissions"); // Load permissions file
        // Commands
        this.commands = new Collection(); // Creates new commands collection
        this.aliases = new Collection(); // Creates new command aliases collection
        // Utils
        this.logger = require("../helpers/logger"); // Load the logger file
        this.functions = require("../helpers/functions"); // Load the functions filec
        this.wait = util.promisify(setTimeout); // client.wait(1000) - Wait 1 second
        this.top = new TOP(this.config.topToken, this);
        // Invitations data
        this.invitations = [];
        this.fetched = false;
        this.fetching = false;
        // Databases
        this.guildMembersData = require("../structures/GuildMember"); // Used to store fake invites, bonus, etc...
        this.guildsData = require("../structures/Guild"); // Used to store prefixes, languages, join messages, etc...
        // Dashboard
        this.dash = require("../dashboard/app");
        this.states = {};
        this.spawned = false;
        this.knownGuilds = [];
    }

    // This function is used to load a command and add it to the collection
    loadCommand (commandPath, commandName) {
        try {
            const props = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
            props.conf.location = commandPath;
            if (props.init){
                props.init(this);
            }
            this.commands.set(props.help.name, props);
            props.conf.aliases.forEach((alias) => {
                this.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    }

    // This function is used to unload a command (you need to load them again)
    async unloadCommand (commandPath, commandName) {
        let command;
        if(this.commands.has(commandName)) {
            command = this.commands.get(commandName);
        } else if(this.aliases.has(commandName)){
            command = this.commands.get(this.aliases.get(commandName));
        }
        if(!command){
            return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
        }
        if(command.shutdown){
            await command.shutdown(this);
        }
        delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
        return false;
    }

    // This function is used to find a guild data or create it
    async findOrCreateGuild(param, isLean){
        let Guild = this.guildsData;
        return new Promise(async function (resolve, reject){
            let guild = (isLean ? await Guild.findOne(param).lean() : await Guild.findOne(param));
            if(guild){
                resolve(guild);
            } else {
                guild = new Guild(param);
                await guild.save();
                resolve(isLean ? guild.toJSON() : guild);
            }
        });
    }

    // This function is used to find a guild member data or create it
    async findOrCreateGuildMember(param, isLean){
        let GuildMember = this.guildMembersData;
        return new Promise(async function (resolve, reject){
            let guildMember = (isLean ? await GuildMember.findOne(param).lean() : await GuildMember.findOne(param));
            if(guildMember){
                resolve(guildMember);
            } else {
                guildMember = new GuildMember(param);
                await guildMember.save();
                resolve(isLean ? guildMember.toJSON() : guildMember);
            }
        });
    }

    async resolveMember(search, guild){
        let member = null;
        if(!search || typeof search !== "string") return;
        // Try ID search
        if(search.match(/^<@!?(\d+)>$/)){
            let id = search.match(/^<@!?(\d+)>$/)[1];
            member = await guild.members.fetch(id).catch(() => {});
            if(member) return member;
        }
        // Try username search
        if(search.match(/^!?([^#]+)#(\d+)$/)){
            guild = await guild.fetch();
            member = guild.members.find((m) => m.user.tag === search);
            if(member) return member;
        }
        member = await guild.members.fetch(search).catch(() => {});
        return member;
    }

    async resolveUser(search){
        let user = null;
        if(!search || typeof search !== "string") return;
        // Try ID search
        if(search.match(/^!?([^#]+)#(\d+)$/)){
            let id = search.match(/^!?([^#]+)#(\d+)$/)[1];
            user = this.users.fetch(id).catch((err) => {});
            if(user) return user;
        }
        // Try username search
        if(search.match(/^!?([^#]+)#(\d+)$/)){
            let username = search.match(/^!?([^#]+)#(\d+)$/)[0];
            let discriminator = search.match(/^!?([^#]+)#(\d+)$/)[1];
            user = this.users.find((u) => u.username === username && u.discriminator === discriminator);
            if(user) return user;
        }
        user = await this.users.fetch(search).catch(() => {});
        return user;
    }

    getLevel(message) {
		let permlvl = 0;
		const permOrder = this.permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);
		while (permOrder.length) {
			const currentLevel = permOrder.shift();
			if(message.guild && currentLevel.guildOnly) continue;
			if(currentLevel.check(message)) {
				permlvl = currentLevel.level;
				break;
			}
		}
		return permlvl;
    }
}

module.exports = ManageInvite;