const { emojis, discord } = require("../config");

module.exports = {

    utils: {
        prefix: (prefix) => `Bonjour! Merci d'utilser **${prefix}help** pour voir toutes les commandes !`
    },

    errors: {
        missingPerms: (neededPermissions) => `__**${emojis.error} Permissions manquantes**__\n\nJ'ai besoin des permissions suivantes pour le bon fonctionnement de cette commande: ${neededPermissions.map((p) => "`"+p+"`").join(", ")}`,
        disabled: () => `${emojis.error} | Cette commande est actuellement désactivée !`,
        permLevel: (name) => `${emojis.error} | Cette commande nécessite le niveau d'autorisation : \`${name}\`!`
    },

    help: {
        title: () => `ℹ Page d'aide de ManageInvite`,
        description: (guildName, prefix) => `> Préfixe sur ${guildName} : **${prefix}** (\`+setprefix\`)\n> Langue sur ${guildName} : **Français** (\`+setlang\`)`,
        // Admin
        admin: {
            title: () => `Admin`,
            content: (prefix) => `
        > **${prefix}addbonus nombre @user**: Ajoute des invitations bonus à un membre
        > **${prefix}removebonus nombre @user**: Retire des invitations bonus à un membre
        > **${prefix}addrank nombre @role**: Ajoute un rôle récompense
        > **${prefix}removerank @role**: Retire un rôle récompense
        > **${prefix}ranks**: Liste des rôles récompenses`
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
        manageInvite: {
            title: () => `ManageInvite`,
            content: (prefix) => `
        > **${prefix}botinfos**: Affiche des informations sur ManageInvite.
        > **${prefix}ping**: Affiche le ping de ManageInvite.
        > **${prefix}partners**: Affiche les partenaires de ManageInvite.
        > **${prefix}support**: Rejoignez le serveur de support.`
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
            content: (guilds, ping, ram) => `
            \`${guilds}\` serveurs
            \`${ping}\` ms
            \`${ram}\` mb ram`
        }
    },

    invite: {
        description: (member, memberData, isYou) => `${isYou ? `Vous avez` : `**${member.user.username}** a`} **${memberData.invites + memberData.bonus - memberData.leaves - memberData.fake}** invitations! (**${memberData.invites}** ordinaires, **${memberData.bonus}** bonus, **${memberData.fake > 0 ? `-${memberData.fake}` : `${memberData.fake}`}** faux, **${memberData.leaves > 0 ? `-${memberData.leaves}` : `${memberData.leaves}`}** partis)`
    },

    leaderboard: {
        cleared: () => `${emojis.success} | Classement effacé !`,
        user: (user, member, lb) => `${lb} **${user.username}** - **${member.calculatedInvites}** invitations (**${member.invites}** ordinaires, **${member.bonus}** bonus, **${member.fake > 0 ? `-${member.fake}` : `${member.fake}`}** faux, **${member.leaves > 0 ? `-${member.leaves}` : `${member.leaves}`}** partis)`,
        prompt: () => `{{user}}, sur quelle page voulez-vous aller ? Écrivez \`cancel\` or \`0\` pour annuler.`,
        title: () => `Classement des invitations`
    },

    membercount: {
        title: (guildName) => `MemberCount de ${guildName}`,
        description: (guild) => `
        Un total de **${guild.members.size}** membres (**${guild.members.filter((m) => !m.user.bot).size}** humains et **${guild.members.filter((m) => !m.user.bot).size}** bots)

        ➔ ${emojis.dnd} | ${guild.members.filter((m) => m.presence.status === "dnd"  && !m.user.bot).size} membres (ne pas déranger)
        ➔ ${emojis.online} | ${guild.members.filter((m) => m.presence.status === "online" && !m.user.bot).size} membres (en ligne)
        ➔ ${emojis.idle} | ${guild.members.filter((m) => m.presence.status === "idle" && !m.user.bot).size} membres (afk)
        ➔ ${emojis.offline} | ${guild.members.filter((m) => m.presence.status === "offline" && !m.user.bot).size} membres (hors-ligne)`
    },

    support: {
        content: () => `:information_source: Si vous avez des questions ou si vous avez besoin de plus d'informations, vous pouvez rejoindre ManageInvite's Lounge :\n${discord}`
    },

    addbonus: {
        errors: {
            bonus: {
                missing: (prefix) => `${emojis.error} | Vous devez écrire le nombre d'invitations bonus que vous voulez ajouter. (Syntaxe : ${prefix}addbonus nombre @membre)`,
                incorrect: (prefix) => `${emojis.error} | YVous devez écrire un nombre __**valide**__ d'invitations bonus que vous voulez ajouter. (Syntaxe : ${prefix}addbonus nombre @membre)`
            },
            member: {
                missing: (prefix) => `${emojis.error} | Vous devez mentionner le membre auquel vous voulez ajouter les invitations bonus. (Syntaxe : ${prefix}addbonus nombre @membre)`
            }
        },
        title: () => `📥 Invitations Bonus Ajoutées`,
        field: (prefix, member) => `Écrivez \`${prefix}invites ${member.user.tag}\` pour voir le nouveau nombre d'invitations de **${member.user.username}** !`
    },

    removebonus: {
        errors: {
            bonus: {
                missing: (prefix) => `${emojis.error} | Vous devez indiquer le nombre d'invitations bonus que vous souhaitez retirer. (Syntaxe : ${prefix}removebonus nombre @membre)`,
                incorrect: (prefix) => `${emojis.error} | You must write a __**valid**__ number of bonus invites that you want to remove. (Syntaxe : ${prefix}removebonus nombre @membre)`
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
            message: (prefix) => `Aucun message défini. Définissez-le avec \`${prefix}setdmjoin\`!`
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
            message: (prefix) => `Aucun message défini. Définissez-le avec \`${prefix}setjoin\`!`,
            channel: (prefix) => `Aucun salon défini. Définissez-le avec \`${prefix}setjoin\`!`
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
            message: (prefix) => `Aucun message défini. Définissez-le avec \`${prefix}setleave\`!`,
            channel: (prefix) => `Aucun salon défini. Définissez-le avec \`${prefix}setleave\`!`
        }
    },

    config: {
        title: (guildName) => `Configuration de ${guildName}`,
        join: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Messages d'arrivées`,
            content: (guild, data) => `
            > Activés: ${data.guild.join.enabled ? "**oui**" : "**non**"}
            > Message: ${data.guild.join.message ? "**défini**" : "**non défini**."}
            > Salon: ${!data.guild.join.channel ? "**non défini**" : (guild.channels.get(data.guild.join.channel) ? "**défini**" : "**salon introuvable**")}`
        },
        leave: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Messages de départs`,
            content: (guild, data) => `
            > Activés: ${data.guild.leave.enabled ? "**oui**" : "**non**"}
            > Message: ${data.guild.leave.message ? "**défini**" : "**non défini**."}
            > Salon: ${!data.guild.leave.channel ? "**non défini**" : (guild.channels.get(data.guild.leave.channel) ? "**défini**" : "**salon introuvable**")}`
        },
        joinDM: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Messages d'arrivées en MP`,
            content: (guild, data) => `
            > Activés: ${data.guild.joinDM.enabled ? "**oui**" : "**non**"}
            > Message: ${data.guild.joinDM.message ? "**défini**" : "**non défini**."}`
        },
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

{guild} : Nom du serveur.
{guild.count} : Nombre de membres que votre serveur a maintenant.

{inviter} : Mentionne l'inviteur.
{inviter.name} : Le nom de l'inviteur.
{inviter.tag} : Le tag de l'inviteur.
{inviter.invites} : Le nombre total d'invitations de l'inviteur.

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

{guild} : Nom du serveur.
{guild.count} : Nombre de membres que votre serveur a maintenant.

{inviter} : Mentionne l'inviteur.
{inviter.name} : Le nom de l'inviteur.
{inviter.tag} : Le tag de l'inviteur.
{inviter.invites} : Le nombre total d'invitations de l'inviteur.

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

{guild} : Nom du serveur.
{guild.count} : Nombre de membres que votre serveur a maintenant.

{inviter} : Mentionne l'inviteur.
{inviter.name} : Le nom de l'inviteur.
{inviter.tag} : Le tag de l'inviteur.
{inviter.invites} : Le nombre total d'invitations de l'inviteur.

{invite.code} : Le code d'invitation utilisé.
{invite.url} : L'url d'invitation utilisée.
{invite.uses} : Nombre d'utilisations du code d'invitation.
\`\`\`
Tapez \`cancel\` pour annuler. ${str}


:pencil: **| Écrivez maintenant le message de départs... :pencil2:**`,
        channel: () => `:scroll: **| Maintenant écrivez le nom du salon des messages de départs ou mentionnez-le... :pencil2:**`
        },
        cancelled: () => `${emojis.error} | Annulé.`,
        success: () => `${emojis.success} **| Done successfully...**`,
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
        success: () => `${emojis.success} | Language mise à jour !`
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
                doesntExist: (prefix, role) => `${emojis.error} | Ce rôle n'est pas utilisé pour les récompenses !`
            }
        },
        title: () => `🎯 Rôle retiré`,
        field: (prefix, role, inviteCount) => `Rôle retiré des récompenses. Les membres ne le recevront plus lorsqu'ils atteindront les **${inviteCount}** invitations.`
    },

    ranks: {
        no: {
            title: (guildName) => `🎯 Aucun rôle`,
            description: (prefix) => `Pour ajouter un rôle récompense (ajouté lorsqu'un membre atteint un certain nombre d'invitations), tapez \`${prefix}addrank nombre @role\` !`
        },
        title: (guildName) => `🎯 Rôles récompenses`,
        formatRank: (rank, inviteCount) => `${rank} (**${inviteCount}** invitations)\n`
    },

    website: {
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
            no: (prefix) => `Aucun rôle récompense défini. Vous pouvez les configurer avec les commandes suivantes : <code>${prefix}addrank</code, <code>${prefix}removerank</code et <code>${prefix}ranks</code>.`,
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
                    default: () => `{user} a quitté le serveur. Il avait été invité par **{inviter.tag}** (qui a **{inviter.invites}** invitations).`
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
    }

};