const { emojis, discord } = require("../config");

module.exports = {

    locale: "fr_FR",

    utils: {
        prefix: (prefix) => `Bonjour! Merci d'utiliser **${prefix}help** pour voir toutes les commandes ! Vous pouvez m'ajouter sur votre serveur avec **${prefix}add**.`,
        viewConf: () => `[Voir la configuration sur le dashboard](https://dash.manage-invite.xyz)`,
        conf: {
            title: () => `Voir la configuration sur le dashboard`,
            content: () => `[ou sur le dashboard](https://dash.manage-invite.xyz)`
        },
        specialMessages: {
            join: {
                oauth2: (user) => `${user} a rejoint le serveur via OAuth.`,
                vanity: (user) => `${user} a rejoint le serveur en utilisant une invitation discord.gg définie par le propriétaire du serveur (ou un admin).`,
                unknown: (user) => `Je n'arrive pas à trouver comment ${user} a rejoint le serveur.`,
                perm: (user) => `${emojis.error} | J'ai besoin d'avoir les permissions de gérer le serveur pour savoir qui a invité ${user}.`
            },
            leave: {
                oauth2: (user) => `${user.tag} a quitté le serveur, il avait rejoint via OAuth.`,
                vanity: (user) => `${user.tag} a quitté le serveur, il avait rejoint en utilisant une invitation discord.gg définie par le propriétaire du serveur (ou un admin).`,
                unknown: (user) => `${user.tag} a quitté le serveur, mais je n'arrive pas à trouver comment il l'avait rejoint.`
            }
        }
    },

    errors: {
        missingPerms: (neededPermissions) => `__**${emojis.error} Permissions manquantes**__\n\nJ'ai besoin des permissions suivantes pour le bon fonctionnement de cette commande: ${neededPermissions.map((p) => "`"+p+"`").join(", ")}`,
        disabled: () => `${emojis.error} | Cette commande est actuellement désactivée !`,
        permLevel: (name) => `${emojis.error} | Cette commande nécessite le niveau d'autorisation : \`${name}\`!`,
        sendPerm: () => `${emojis.error} | Je n'ai pas la permission d'envoyer des messages dans ce salon !`
    },

    help: {
        title: () => `ℹ Page d'aide de ManageInvite`,
        description: (guildName, prefix) => `> Préfixe sur ${guildName} : **${prefix}** (\`${prefix}setprefix\`)\n> Langue sur ${guildName} : **Français** (\`${prefix}setlang\`)`,
        // Admin
        admin: {
            title: () => `Admin`,
            content: (prefix) => `
        > **${prefix}blacklist [add/remove/list] (@user)**: Ajoute/Enlève un membre à la liste noire
        > **${prefix}addbonus nombre @user**: Ajoute des invitations bonus à un membre
        > **${prefix}removebonus nombre @user**: Retire des invitations bonus à un membre
        > **${prefix}sync-invites**: Synchronise les invitations du bot avec celles du serveur
        > **${prefix}removeinvites (@user)**: Supprime les invitations (serveur/membre)
        > **${prefix}restoreinvites (@user)**: Restaure les invitations (serveur/membre)`
        },
        // Ranks
        ranks: {
            title: () => `Rôle récompenses`,
            content: (prefix) => `
        > **${prefix}addrank nombre @role**: Ajoute un rôle récompense
        > **${prefix}removerank @role**: Retire un rôle récompense
        > **${prefix}ranks**: Liste des rôles récompenses
        > **${prefix}setkeep-ranks**: Configure le paramètre "keep-ranks"`
        },
        // Join DM Messages
        joinDM: {
            title: () => `Messages d'arrivées en MP`,
            content: (prefix) => `
        > **${prefix}configdm**: Configurer les messages d'__**arrivées en mp**__
        > **${prefix}setdm**: Désactiver/Activer les messages d'__**arrivées en mp**__
        > **${prefix}testdm**: Tester les messages d'__**arrivées en mp**__`
        },
        // Join Messages
        join: {
            title: () => `Messages d'arrivées`,
            content: (prefix) => `
        > **${prefix}configjoin**: Configurer les messages d'__**arrivées**__
        > **${prefix}setjoin**: Désactiver/Activer les messages d'__**arrivées**__
        > **${prefix}testjoin**: Tester les messages d'__**arrivées**__`
        },
        // Leave Messages
        leave: {
            title: () => `Messages de départs`,
            content: (prefix) => `
        > **${prefix}configleave**: Configurer les messages de __**départs**__
        > **${prefix}setleave**: Désactiver/Activer les messages de __**départs**__
        > **${prefix}testleave**: Tester les messages de __**départs**__`
        },
        // Invites
        invites: {
            title: () => `Invitations`,
            content: (prefix) => `
        > **${prefix}invite (@user)**: Donne le nombre d'invitations que vous avez ou qu'a le membre mentionné.
        > **${prefix}leaderboard**: Affiche le classement des invitations du serveur.`,
        },
        // ManageInvite
        manageInvite: {
            title: () => `ManageInvite`,
            content: (prefix) => `
        > **${prefix}botinfos**: Affiche des informations sur ManageInvite.
        > **${prefix}ping**: Affiche le ping de ManageInvite.
        > **${prefix}partners**: Affiche les partenaires de ManageInvite.
        > **${prefix}support**: Rejoignez le serveur de support.
        > **${prefix}stats**: Affichez les stats d'arrivées de votre serveur.
        > **${prefix}add**: Ajoutez-moi sur votre serveur.`
        },
        // Others
        tip: (prefix) => `Astuce : vous pouvez voir votre configuration avec la commande ${prefix}config`,
        links: (clientID) => `[Ajoutez-moi à votre serveur](https://discordapp.com/api/oauth2/authorize?client_id=${clientID}&permissions=8&scope=bot) | [Serveur de support](${discord}) | [Votez pour moi](https://top.gg/bot/${clientID})`
    },

    botinfos: {
        author: (username) => `Statistiques de ${username}`,
        // Statistics
        statistics: {
            title: () => `📊 Statistiques`,
            content: (guilds, users) => `\`Serveurs: ${guilds}\`\n\`Utilisateurs: ${users}\``
        },
        // Versions
        versions: {
            title: () => `⚙️ Versions`,
            content: (djs, node) => `\`Discord: v${djs}\`\n\`Node: ${node}\``
        },
        // Shard
        shard: {
            title: (shardID, current) => `${emojis.online} Shard #${shardID} ${current ? `(actuel)` : ""}`,
            content: (guilds, ping, ram, cachedMembers, cachedGuilds) => `
            \`${guilds}\` serveurs
            \`${ping}\` ms
            \`${ram}\` mb ram
            \`${cachedMembers}\` membres en cache
            \`${cachedGuilds}\` serveurs en cache`,
        }
    },

    invite: {
        description: (member, memberData, isYou, nextRank, role) => `${isYou ? `Vous avez` : `**${member.user.username}** a`} **${memberData.regular + memberData.bonus - memberData.leaves - memberData.fake}** invitations! (**${memberData.regular}** ordinaires, **${memberData.bonus}** bonus, **${memberData.fake > 0 ? `-${memberData.fake}` : `${memberData.fake}`}** faux, **${memberData.leaves > 0 ? `-${memberData.leaves}` : `${memberData.leaves}`}** partis)${nextRank ? `\nIl vous faut encore **${nextRank.inviteCount - (memberData.regular + memberData.bonus - memberData.leaves - memberData.fake)}** invitations pour atteindre le grade **${role}** !` : ""}`
    },

    leaderboard: {
        cleared: () => `${emojis.success} | Classement effacé !`,
        user: (user, member, lb) => `${lb} **${user.username}** - **${member.calculatedInvites}** invitations (**${member.regular}** ordinaires, **${member.bonus}** bonus, **${member.fake > 0 ? `-${member.fake}` : `${member.fake}`}** faux, **${member.leaves > 0 ? `-${member.leaves}` : `${member.leaves}`}** partis)`,
        prompt: () => `{{user}}, sur quelle page voulez-vous aller ? Écrivez \`cancel\` or \`0\` pour annuler.`,
        title: () => `Classement des invitations`,
        empty: {
            title: () => `😕 Aucune invitation trouvée`,
            content: () => `Commencez à inviter des gens et vous apparaitrez sur cette page !`
        }
    },

    fetchInvites: {
        success: () => `${emojis.success} Invitations récupérées avec succès!`
    },

    userinfo: {
        title: (user) => `Compte ${user.tag} (${user.id})`,
        fields: {
            // user
            createdAt: {
                title: () => `Création`
            },
            bot: {
                title: () => `Robot`,
                content: (user) => user.bot ? "Oui" : "Non"
            },
            // member
            joinedAt: {
                title: () => `Arrivée`
            },
            joinWay: {
                title: () => `Arrivée grâce à`,
                oauth: () => `Invitation oauth2 (via discordapp.com).`,
                vanity: () => `Invitation personnalisée configurée par un administrateur.`,
                unknown: (user) => `Impossible de déterminer comment ${user.username} a rejoint le serveur.`,
                invite: (user) => user.tag
            },
            invites: {
                title: () => `Invitations`,
                content: (inviteData) => `**${inviteData.regular + inviteData.bonus - inviteData.leaves - inviteData.fake}** invitations (**${inviteData.regular}** ordinaires, **${inviteData.bonus}** bonus, **${inviteData.fake > 0 ? `-${inviteData.fake}` : `${inviteData.fake}`}** faux, **${inviteData.leaves > 0 ? `-${inviteData.leaves}` : `${inviteData.leaves}`}** partis)`
            },
            joinOrder: {
                title: () => `Ordre d'arrivées`,
                content: (previous, next, user) => `${previous ? `**${previous.tag}** > ` : ""}**${user.tag}**${next ? ` > **${next.tag}**` : ""}`
            },
            invitedUsers: {
                premium: (username) => `:crown: | Hey, **${username}** ! Cette fonctionnalité est disponible seulement pour les serveurs premium et les partenaires. Deviens premium ici: **<https://docs.manage-invite.xyz/configuration/premium>** !`,
                title: () => `Membres invités`,
                content: (users, andMore, nobody) => nobody ? "Aucun membre invité" : andMore ? `${users.join(", ")}, et plus...` : users.join(", ")
            }
        }
    },

    membercount: {
        title: (guildName) => `MemberCount de ${guildName}`,
        description: (guild) => `
        Un total de **${guild.members.cache.size}** membres (**${guild.members.cache.filter((m) => !m.user.bot).size}** humains et **${guild.members.cache.filter((m) => m.user.bot).size}** bots)

        ➔ ${emojis.dnd} | ${guild.members.cache.filter((m) => m.presence.status === "dnd"  && !m.user.bot).size} membres (ne pas déranger)
        ➔ ${emojis.online} | ${guild.members.cache.filter((m) => m.presence.status === "online" && !m.user.bot).size} membres (en ligne)
        ➔ ${emojis.idle} | ${guild.members.cache.filter((m) => m.presence.status === "idle" && !m.user.bot).size} membres (afk)
        ➔ ${emojis.offline} | ${guild.members.cache.filter((m) => m.presence.status === "offline" && !m.user.bot).size} membres (hors-ligne)`
    },

    support: {
        content: () => `:information_source: Si vous avez des questions ou si vous avez besoin de plus d'informations, vous pouvez rejoindre ManageInvite's Lounge :\n${discord}`
    },

    addbonus: {
        errors: {
            bonus: {
                missing: (prefix) => `${emojis.error} | Vous devez écrire le nombre d'invitations bonus que vous voulez ajouter. (Syntaxe : ${prefix}addbonus nombre @membre)`,
                incorrect: (prefix) => `${emojis.error} | Vous devez écrire un nombre __**valide**__ d'invitations bonus que vous voulez ajouter. (Syntaxe : ${prefix}addbonus nombre @membre)`
            },
            member: {
                missing: (prefix) => `${emojis.error} | Vous devez mentionner le membre auquel vous voulez ajouter les invitations bonus. (Syntaxe : ${prefix}addbonus nombre @membre)`
            }
        },
        title: () => `📥 Invitations Bonus Ajoutées`,
        field: (prefix, member) => `Écrivez \`${prefix}invites ${member.user.tag}\` pour voir le nouveau nombre d'invitations de **${member.user.username}** !`
    },

    blacklist: {
        blacklisted: () => `${emojis.error} | Vous êtes sur la liste noire de ce serveur, vous ne pouvez pas taper cette commande!`,
        blacklistedMember: (member) => `${member.user.tag} est sur la liste noir de ce serveur.`,
        action: {
            error: () => `${emojis.error} | Vous devez entrer une action valide! (\`add\`, \`remove\` ou \`list\`)\n\n:information_source: Les utilisateurs de la liste noire:\n- Ne recevront/perdront plus de rôle\n- N'apparaitront plus sur le classement\n- N'auront plus leur invitations traquées\n- Ne pourront pas taper la commande \`invites\``
        },
        mentions: {
            add: () => `${emojis.error} | Vous devez mentionner un membre valide à ajouter à la liste noire !`,
            remove: () => `${emojis.error} | Vous devez mentionner un membre valide à retirer de la liste noire !`
        },
        success: {
            add: (user) => `${emojis.success} | **${user.tag}** a été ajouté à la liste noire !`,
            remove: (user) => `${emojis.success} | **${user.tag}** a été retiré de la liste noire !`
        },
        empty: () => `Aucun utilisateur sur liste noire !`,
        notFound: (user) => `${emojis.error} | **${user.tag}** n'est pas dans la liste noire !`
    },

    removebonus: {
        errors: {
            bonus: {
                missing: (prefix) => `${emojis.error} | Vous devez indiquer le nombre d'invitations bonus que vous souhaitez retirer. (Syntaxe : ${prefix}removebonus nombre @membre)`,
                incorrect: (prefix) => `${emojis.error} | Vous devez écrire un nombre __**valide**__ d'invitations bonus que vous souhaitez supprimer. (Syntaxe : ${prefix}removebonus nombre @membre)`
            },
            member: {
                missing: (prefix) => `${emojis.error} | Vous devez mentionner le membre auquel vous souhaitez supprimer les invitations bonus. (Syntaxe : ${prefix}removebonus nombre @membre)`
            }
        },
        title: () => `📥 Invitations Bonus Retirées`,
        field: (prefix, member) => `Écrivez \`${prefix}invites ${member.user.tag}\` pour voir le nouveau nombre d'invitations de **${member.user.username}** !`
    },

    setdmjoin: {
        on: () => `**${emojis.success} | Le système de messages d'arrivées en mp est maintenant __ACTIVÉ__ !**`,
        off: () => `**${emojis.success} | Le système de messages d'arrivées en mp est maintenant __DÉSACTIVÉ__ !**`
    },

    setjoin: {
        on: () => `**${emojis.success} | Le système de messages d'arrivées est maintenant __ACTIVÉ__ !**`,
        off: () => `**${emojis.success} | Le système de messages d'arrivées est maintenant __DÉSACTIVÉ__ !**`
    },

    setleave: {
        on: () => `**${emojis.success} | Le système de messages de départs est maintenant __ACTIVÉ__ !**`,
        off: () => `**${emojis.success} | Le système de messages de départs est maintenant __DÉSACTIVÉ__ !**`
    },

    setkeepranks: {
        premium: (username) => `:crown: | Hey, **${username}** ! Cette fonctionnalité est disponible seulement pour les serveurs premium et les partenaires. Deviens premium ici: **<https://docs.manage-invite.xyz/configuration/premium>** !`,
        on: () => `**${emojis.success} | Maintenant, les membres __GARDERONT__ leurs rôles, même s'ils n'ont pas assez d'invitations!**`,
        off: () => `**${emojis.success} | Maintenant, les membres __NE GARDERONT__ pas leurs rôles s'ils n'ont pas assez d'invitations!**`
    },

    setprefix: {
        missing: () => `${emojis.error} | Vous devez écrire un préfixe !`,
        success: () => `${emojis.success} | Le préfixe du serveur a été mis à jour !`
    },

    testdmjoin: {
        title: () => `:wrench: Système des messages d'arrivées en MP :`,
        description: () => `Si cela ne fonctionne pas, vérifiez les permissions du bot ou rejoignez notre [serveur support](${discord})`,
        fields: {
            enabled: () => `> Activés:`,
            message: () => `> Message:`
        },
        enabled: (prefix) => `${emojis.success} Messages d'arrivées en mp activés. Désactivez-les avec \`${prefix}setdmjoin\`.`,
        disabled: (prefix) =>  `${emojis.error} Messages d'arrivées en mp désactivés Activez-les avec \`${prefix}setdmjoin\`.`,
        notDefineds: {
            message: (prefix) => `Aucun message défini. Définissez-le avec \`${prefix}configdm\`!`
        }
    },

    testjoin: {
        title: () => `:wrench: Système des messages d'arrivées :`,
        description: () => `Si cela ne fonctionne pas, vérifiez les permissions du bot ou rejoignez notre [serveur support](${discord})`,
        fields: {
            enabled: () => `> Activés:`,
            channel: () => `> Salon:`,
            message: () => `> Message:`
        },
        enabled: (prefix) => `${emojis.success} Messages d'arrivées activés. Désactivez-les avec \`${prefix}setjoin\`.`,
        disabled: (prefix) =>  `${emojis.error} Messages d'arrivées désactivés. Activez-les avec \`${prefix}setjoin\`.`,
        notDefineds: {
            message: (prefix) => `Aucun message défini. Définissez-le avec \`${prefix}configjoin\`!`,
            channel: (prefix) => `Aucun salon défini. Définissez-le avec \`${prefix}configjoin\`!`
        }
    },

    testleave: {
        title: () => `:wrench: Système des messages de départs :`,
        description: () => `Si cela ne fonctionne pas, vérifiez les permissions du bot ou rejoignez notre [serveur support](${discord})`,
        fields: {
            enabled: () => `> Activés:`,
            channel: () => `> Salon:`,
            message: () => `> Message:`
        },
        enabled: (prefix) => `${emojis.success} Messages de départs activés. Désactivez-les avec \`${prefix}setleave\`.`,
        disabled: (prefix) =>  `${emojis.error} Messages de départs désactivés. Activez-les avec \`${prefix}setleave\`.`,
        notDefineds: {
            message: (prefix) => `Aucun message défini. Définissez-le avec \`${prefix}configleave\`!`,
            channel: (prefix) => `Aucun salon défini. Définissez-le avec \`${prefix}configleave\`!`
        }
    },

    config: {
        title: (guildName) => `Configuration de ${guildName}`,
        join: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Messages d'arrivées`,
            content: (guild, data) => `
            > Activés: ${data.guild.join.enabled ? "**oui**" : "**non**"}
            > Message: ${data.guild.join.message ? "**défini**" : "**non défini**."}
            > Salon: ${!data.guild.join.channel ? "**non défini**" : (guild.channels.cache.get(data.guild.join.channel) ? "**défini**" : "**salon introuvable**")}`
        },
        leave: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Messages de départs`,
            content: (guild, data) => `
            > Activés: ${data.guild.leave.enabled ? "**oui**" : "**non**"}
            > Message: ${data.guild.leave.message ? "**défini**" : "**non défini**."}
            > Salon: ${!data.guild.leave.channel ? "**non défini**" : (guild.channels.cache.get(data.guild.leave.channel) ? "**défini**" : "**salon introuvable**")}`
        },
        joinDM: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Messages d'arrivées en MP`,
            content: (guild, data) => `
            > Activés: ${data.guild.joinDM.enabled ? "**oui**" : "**non**"}
            > Message: ${data.guild.joinDM.message ? "**défini**" : "**non défini**."}`
        },
    },

    joinDM: {
        premium: (username) => `:crown: | Hey, **${username}** ! Cette fonctionnalité est disponible seulement pour les serveurs premium et les partenaires. Deviens premium ici: **<https://docs.manage-invite.xyz/configuration/premium>** !`
    },

    configdmjoin: {
        disable: (prefix) => `Tapez \`${prefix}setdmjoin\` pour désactiver les messages d'arrivées en mp.`,
        instruct: (str) => `
__**Plus d'informations**__
\`\`\`
{user} : Mentionne le membre qui vient de rejoindre votre serveur.
{user.name} : Le pseudo du membre qui vient de rejoindre votre serveur.
{user.tag} : Le tag du membre qui vient de rejoindre votre serveur.
{user.createdat} : L'âge du compte du membre.
{user.id} : L'ID du membre.

{guild} : Nom du serveur.
{guild.count} : Nombre de membres que votre serveur a maintenant.

{inviter} : Mentionne l'inviteur.
{inviter.name} : Le nom de l'inviteur.
{inviter.tag} : Le tag de l'inviteur.
{inviter.invites} : Le nombre total d'invitations de l'inviteur.
{inviter.id} : L'ID de l'inviteur.

{invite.code} : Le code d'invitation utilisé.
{invite.url} : L'url d'invitation utilisée.
{invite.uses} : Nombre d'utilisations du code d'invitation.
\`\`\`
Tapez \`cancel\` pour annuler. ${str}


:pencil: **| Écrivez maintenant le message d'arrivées en MP... :pencil2:**`,
        cancelled: () => `${emojis.error} | Annulé.`,
        success: () => `${emojis.success} **| Réalisé avec succès...**`,
        title: () => `**Le Msg d'Arrivées en MP a été mis en place**`,
        fields: {
            message: () => `Message:`,
            testIt: () => `Testez-le:`,
            cmd: (prefix) => `Utilisez \`${prefix}testdmjoin\` pour tester le nouveau message.`
        },
    },

    configjoin: {
        disable: (prefix) => `Utilisez \`${prefix}setjoin\` pour désactiver les messages d'arrivées.`,
        instructs: {
            message: (str) => `
__**Plus d'informations**__
\`\`\`
{user} : Mentionne le membre qui vient de rejoindre votre serveur.
{user.name} : Le pseudo du membre qui vient de rejoindre votre serveur.
{user.tag} : Le tag du membre qui vient de rejoindre votre serveur.
{user.createdat} : L'âge du compte du membre.
{user.id} : L'ID du membre.

{guild} : Nom du serveur.
{guild.count} : Nombre de membres que votre serveur a maintenant.

{inviter} : Mentionne l'inviteur.
{inviter.name} : Le nom de l'inviteur.
{inviter.tag} : Le tag de l'inviteur.
{inviter.invites} : Le nombre total d'invitations de l'inviteur.
{inviter.id} : L'ID de l'inviteur.

{invite.code} : Le code d'invitation utilisé.
{invite.url} : L'url d'invitation utilisée.
{invite.uses} : Nombre d'utilisations du code d'invitation.
\`\`\`
Tapez \`cancel\` pour annuler. ${str}


:pencil: **| Écrivez maintenant le message d'arrivées... :pencil2:**`,
            channel: () => `:scroll: **| Maintenant écrivez le nom du salon des messages d'arrivées ou mentionnez-le... :pencil2:**`
        },
        cancelled: () => `${emojis.error} | Annulé.`,
        success: () => `${emojis.success} **| Réalisé avec succès...**`,
        title: () => `**Le Msg d'Arrivées a été mis en place**`,
        fields: {
            message: () => `Message:`,
            channel: () => `Salon:`,
            testIt: () => `Testez-le:`,
            cmd: (prefix) => `Utilisez \`${prefix}testjoin\` pour tester le nouveau message.`
        },
        errors: {
            channelNotFound: (channel) => `${emojis.error} | Aucun salon trouvé pour \`${channel}\``
        }
    },

    configleave: {
        disable: (prefix) => `Utilisez \`${prefix}setleave\` pour désactiver les messages de départs.`,
        instructs: {
            message: (str) => `
__**Plus d'informations**__
\`\`\`
{user} : Mentionne le membre qui vient de partir de votre serveur.
{user.name} : Le pseudo du membre qui vient de partir de votre serveur.
{user.tag} : Le tag du membre qui vient de partir de votre serveur.
{user.createdat} : L'âge du compte du membre.
{user.id} : L'ID du membre.

{guild} : Nom du serveur.
{guild.count} : Nombre de membres que votre serveur a maintenant.

{inviter} : Mentionne l'inviteur.
{inviter.name} : Le nom de l'inviteur.
{inviter.tag} : Le tag de l'inviteur.
{inviter.invites} : Le nombre total d'invitations de l'inviteur.
{inviter.id} : L'ID de l'inviteur.

{invite.code} : Le code d'invitation utilisé.
{invite.url} : L'url d'invitation utilisée.
{invite.uses} : Nombre d'utilisations du code d'invitation.
\`\`\`
Tapez \`cancel\` pour annuler. ${str}


:pencil: **| Écrivez maintenant le message de départs... :pencil2:**`,
        channel: () => `:scroll: **| Maintenant écrivez le nom du salon des messages de départs ou mentionnez-le... :pencil2:**`
        },
        cancelled: () => `${emojis.error} | Annulé.`,
        success: () => `${emojis.success} **| Réalisé avec succès...**`,
        title: () => `**Le Msg de Départs a été mis en place**`,
        fields: {
            message: () => `Message:`,
            channel: () => `Salon:`,
            testIt: () => `Testez-le:`,
            cmd: (prefix) => `Utilisez \`${prefix}testleave\` pour tester le nouveau message`
        },
        errors: {
            channelNotFound: (channel) => `${emojis.error} | Aucun salon trouvé pour \`${channel}\``
        }
    },

    setlang: {
        invalid: () => `${emojis.error} | Vous devez entrer une langue valide !\n\n:flag_fr: Français (\`fr\`)\n:flag_gb: English (\`en\`)`,
        success: () => `${emojis.success} | Langue mise à jour !`
    },

    addrank: {
        errors: {
            inviteCount: {
                missing: (prefix) => `${emojis.error} | Vous devez écrire le nombre d'invitations nécessaires pour obtenir le grade. (Syntaxe : ${prefix}addrank nombre @role)`,
                incorrect: (prefix) => `${emojis.error} | Vous devez écrire un nombre __**valide**__ d'invitations nécessaires pour obtenir le grade. (Syntaxe : ${prefix}addrank nombre @role)`,
                alreadyExists: (prefix, rank, role) => `${emojis.error} | Il y a déjà un rôle défini pour **${rank.inviteCount}** invitations (\`@${role.name}\`) ! Retirez-le avec \`${prefix}removerank ${role.id}\` puis réessayez !`
            },
            role: {
                missing: (prefix) => `${emojis.error} | Vous devez mentionner le rôle que vous souhaitez ajouter quand le quota d'invitation est atteint. (Syntaxe : ${prefix}addrank nombre @role)`,
                alreadyExists: (prefix, rank, role) => `${emojis.error} | Ce rôle est déjà utilisé comme récompense pour les **${rank.inviteCount}** invitations ! Retirez-le avec \`${prefix}removerank ${role.id}\` puis réessayez !`,
                perm: (role) => `${emojis.error} | Mon rôle n'est pas assez haut pour ajouter le rôle \`@${role.name}\` aux membres ! Veuillez monter mon rôle puis réessayez !`
            }
        },
        title: () => `🎯 Nouveau rôle ajouté`,
        field: (prefix, role, inviteCount) => `Lorsqu'un membre atteindra les **${inviteCount}** invitations, il recevra le rôle \`@${role.name}\` !`
    },

    removerank: {
        errors: {
            role: {
                missing: (prefix) => `${emojis.error} | Vous devez mentionner le rôle que vous souhaitez retirer. (Syntaxe : ${prefix}removerank @role)`,
                doesntExist: () => `${emojis.error} | Ce rôle n'est pas utilisé pour les récompenses !`
            }
        },
        title: () => `🎯 Rôle retiré`,
        field: (prefix, role, inviteCount) => `Rôle retiré des récompenses. Les membres ne le recevront plus lorsqu'ils atteindront les **${inviteCount}** invitations.`
    },

    ranks: {
        no: {
            title: () => `🎯 Aucun rôle`,
            description: (prefix) => `Pour ajouter un rôle récompense (ajouté lorsqu'un membre atteint un certain nombre d'invitations), tapez \`${prefix}addrank nombre @role\` !`
        },
        title: () => `🎯 Rôles récompenses`,
        formatRank: (rank, inviteCount) => `${rank} (**${inviteCount}** invitations)\n`
    },

    website: {
        doc: {
            variables: () => `https://docs.manage-invite.xyz/v/francais/configuration/variables`
        },
        utils: {
            members: () => `membres`
        },
        conf: {
            title: () => `Configuration`
        },
        selector: {
            title: () => `Sélecteur`,
            manage: () => `Gérer`,
            no: {
                title: () => `Aucun serveur`,
                content: () => `Aucun serveur trouvé. Veuillez vérifier que vous êtes connecté avec le bon compte !`
            }
        },
        help: {
            title: () => `Aide`,
            doc: () => `Documentation`,
            support: () => `Serveur support`
        },
        ranks: {
            title: () => `🎯 Rôle récompenses`,
            no: (prefix) => `Aucun rôle récompense défini. Vous pouvez les configurer avec les commandes suivantes : ${prefix}addrank, ${prefix}removerank et ${prefix}ranks.`,
            fields: {
                role: () => `Rôle`,
                invites: () => `Invitations`
            }
        },
        forms: {
            buttons: {
                enable: () => `Activer les messages`,
                disable: () => `Désactiver les messages`,
                update: () => `Mettre à jour les messages`
            },
            basic: {
                title: () => `⚙️ Configuration basique`,
                language: () => `Langue`,
                prefix: () => `Préfixe`,
                update: () => `Mettre à jour`
            },
            join: {
                title: () => `🏁 Messages d'arrivées`,
                message: {
                    title: () => `Message`,
                    default: () => `{user} a rejoint le serveur ! Il a été invité par **{inviter.tag}** (qui a **{inviter.invites}** invitations).`
                },
                channel: {
                    title: () => `Salon`
                }
            },
            leave: {
                title: () => `🛫 Messages de départs`,
                message: {
                    title: () => `Message`,
                    default: () => `{user.tag} a quitté le serveur. Il avait été invité par **{inviter.tag}** (qui a **{inviter.invites}** invitations).`
                },
                channel: {
                    title: () => `Salon`
                }
            },
            joinDM: {
                title: () => `🔔 Messages d'arrivées en MP`,
                premium: () => `Fonctionnalité disponible pour les serveurs premium et les partenaires.`,
                message: {
                    title: () => `Message`,
                    default: () => `Bienvenue {user} sur **{server} ! Tu as été invité par **{inviter.tag}**. N'oublie pas d'aller lire les règles du serveur !`
                }
            }
        }
    },

    removeinvites: {
        loading: {
            all: (prefix) => `${emojis.loading} | Suppression des invitations du serveur en cours... Vous pourrez les restaurer avec la commande \`${prefix}restore-invites\` !`,
            member: (prefix, member) => `${emojis.loading} | Suppression des invitations de **${member.user.tag}** en cours... Vous pourrez les restaurer grâce à la commande \`${prefix}restore-invites ${member.user.tag}\` !`
        },
        title: () => `☄️ Invitations réinitialisées`,
        titles: {
            all: (prefix) => `${emojis.success} | Invitations du serveur réinitalisées ! Vous pouvez les restaurer grâce la commande \`${prefix}restore-invites\` !`,
            member: (prefix, member) => `${emojis.success} | Invitations de **${member.user.tag}** réinitalisées ! Vous pouvez les restaurer grâce à la commande \`${prefix}restore-invites ${member.user.tag}\` !`
        }
    },

    restoreinvites: {
        confirmations: {
            all: (prefix, memberCount) => `${emojis.warn} | Êtes-vous sur de vouloir restaurer les invitations du serveur ? Tous les membres récupèreront les invitations qu'ils avaient avant la dernière fois que la commande \`${prefix}remove-invites\` a été tapée (ou 0 si la commande n'a jamais été tapée).\n\n:information_source: **Aperçu des invitations**:\nIl sera restauré, au total: **${memberCount.regular}** ordinaires, **${memberCount.bonus}** bonus, **${memberCount.leaves}** partis, **${memberCount.fake}** fake.\n\n${emojis.success} Tapez \`-confirm\` pour confirmer.\n${emojis.error} Tapez \`cancel\` pour annuler.`,
            member: (prefix, member) => `${emojis.warn} | Êtes-vous sur de vouloir restaurer les invitations de **${member.user.tag}** ? Il récupèrera les invitations qu'il avait avant la dernière fois que la commande \`${prefix}remove-invites\` a été tapée (ou 0 si la commande n'a jamais été tapée).\n\n:information_source: **Aperçu des invitations**:\nIl sera restauré: **${member.data.regular}** ordinaires, **${member.data.bonus}** bonus, **${member.data.leaves}** partis, **${member.data.fake}** fake.\n\n${emojis.success} Tapez \`-confirm\` pour confirmer.\n${emojis.error} Tapez \`cancel\` pour annuler.`,
            cancelled: () => `${emojis.error} Annulé.`
        },
        loading: {
            all: () => `${emojis.loading} | Restauration des invitations du serveur en cours...`,
            member: (member) => `${emojis.loading} | Restauration des invitations de **${member.user.tag}** en cours...`
        },
        title: () => `☄️ Invitations restaurées`,
        titles: {
            all: () => `${emojis.success} | Invitations du serveur restaurées !`,
            member: (member) => `${emojis.success} | Invitations de **${member.user.tag}** restaurées !`
        }
    },

    syncinvites: {
        no: () => `${emojis.error} | Aucune invitation à synchroniser n'est disponible.`,
        confirmations: {
            all: (inviteCount) => `${emojis.warn} | Êtes-vous sur de vouloir synchroniser les invitations du serveur ?\n\n:information_source: **Aperçu des invitations**:\nIl sera restauré **${inviteCount}** invitations ordinaires.\n\n${emojis.success} Tapez \`-confirm\` pour confirmer.\n${emojis.error} Tapez \`cancel\` pour annuler.`,
            cancelled: () => `${emojis.error} Annulé.`
        },
        title: () => `☄️ Invitations synchronisées`,
        titles: {
            all: () => `${emojis.success} | Invitations du serveur synchronisées !`
        }
    },

    add: {
        content: (id) => `Vous pouvez m'ajouter sur votre serveur en cliquant [ici](https://discordapp.com/oauth2/authorize?client_id=${id}&scope=bot&permissions=2146958847).`,
        requested: (username) => `Demandé par ${username}`
    },

    stats: {
        title: (name, nb) => `Arrivées sur ${name} ces ${nb} derniers jours`,
        content: (total, percent, days) => `**${total}** membres (soit **${percent}%** du serveur) ont rejoint le serveur du ${days[0]} au ${days[1]} :`,
        premium: (username) => `:crown: | Hey, **${username}** ! Cette fonctionnalité (période de statistiques personnalisée) est disponible seulement pour les serveurs premium et les partenaires. Deviens premium ici: **<https://docs.manage-invite.xyz/configuration/premium>** !`,
        errors: {
            invalid: () => `${emojis.error} | Vous devez entrer un nombre de jours valide (supérieur à 1 et inférieur à 1000) à afficher !`
        }
    },

    monthIndex: [
        "Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juill", "Août", "Sept", "Oct", "Nov", "Déc"
    ]

};
