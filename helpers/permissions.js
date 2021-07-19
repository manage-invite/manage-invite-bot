const { Permissions } = require("discord.js");

module.exports = [
    {
        level: 0,
        name: "User",
        check: () => true,
    },
    {
        level: 1,
        name: "Moderator",
        check: (member) => member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES),
    },
    {
        level: 2,
        name: "Administrator",
        check: (member) => member.permissions.has(Permissions.FLAGS.ADMINISTRATOR),
    },
    {
        level: 3,
        name: "Owner",
        check: (member) => member.id === member.guild.ownerID,
    },
    {
        level: 4,
        name: "Bot moderator",
        check: (member) => {
            return (
                [
                    "709481084286533773", // Rome
                    "280762060864880640", // GTA Tetris
                    "654754795336237058", // Ethan
                    "456500252048883714", // Clèm31
                    "547514927019982864", // Mystèreee
                    "592782178350399673" // Micka
                ].includes(member.id)
                || (
                    member.client.guilds.cache.has(member.client.config.supportServer)
                        ? (
                            member.client.guilds.cache.get(member.client.config.supportServer).members.cache.get(member.id)
                                ? member.client.guilds.cache.get(member.client.config.supportServer).members.cache.get(member.id).roles.cache.has(member.client.config.modRole)
                                : false)
                        : false)
            );
        }
    },
    {
        level: 5,
        name: "Bot owner",
        check: (member) => member.client.config.owners.includes(member.id),
    }
];
