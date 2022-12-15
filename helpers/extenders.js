const { Guild, Message } = require("discord.js");
const Constants = require("./constants");

Guild.prototype.translate = function (key, args) {
    const language = this.client.translations.get(this.settings.language);
    if (!language) throw "Message: Invalid language set in data.";
    return language(key, args);
};

Message.prototype.translate = function (key, args) {
    const language = this.client.translations.get(
        this.guild ? this.guild.settings.language : "en-US"
    );
    if (!language) throw "Message: Invalid language set in data.";
    return language(key, args);
};

// Translate and send the message with an error emoji
Message.prototype.error = function (key, args, edit = false, embed = false) {
    const botMember = this.guild.members.cache.get(this.client.user.id);
    if (
        embed &&
        this.channel.permissionsFor(botMember).has("EMBED_LINKS")
    ) {
        const embed = {
            color: 0xFF0000,
            description: this.translate(key, args)
        };
        return edit ? this.edit({ embed }) : this.channel.send({ embed });
    } else {
        const updatedContent = `${Constants.Emojis.ERROR} | ${this.translate(
            key,
            args
        )}`;
        return edit
            ? this.edit(updatedContent)
            : this.channel.send(updatedContent);
    }
};

// Translate and send the message with a success emoji
Message.prototype.success = function (key, args, edit = false, embed = false) {
    const botMember = this.guild.members.cache.get(this.client.user.id);
    if (
        embed &&
        this.channel.permissionsFor(botMember).has("EMBED_LINKS")
    ) {
        const embed = {
            color: 0x32CD32,
            description: this.translate(key, args)
        };
        return edit ? this.edit({ embeds: [embed] }) : this.channel.send({ embeds: [embed] });
    } else {
        const updatedContent = `${Constants.Emojis.SUCCESS} | ${this.translate(
            key,
            args
        )}`;
        return edit
            ? this.edit(updatedContent)
            : this.channel.send(updatedContent);
    }
};

// Translate and send the message
Message.prototype.sendT = function (
    key,
    args,
    edit = false,
    embed = false,
    emoji = null
) {
    const botMember = this.guild.members.cache.get(this.client.user.id);
    const prefix = emoji ? `${Constants.Emojis[emoji.toUpperCase()]} | ` : "";
    if (
        embed &&
        this.channel.permissionsFor(botMember).has("EMBED_LINKS")
    ) {
        const embed = {
            color: Constants.Embed.COLOR,
            description: prefix + this.translate(key, args)
        };
        return edit ? this.edit({ embeds: [embed] }) : this.channel.send({ embeds: [embed] });
    } else {
        return edit
            ? this.edit(prefix + this.translate(key, args))
            : this.channel.send(prefix + this.translate(key, args));
    }
};
