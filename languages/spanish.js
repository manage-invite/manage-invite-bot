const { emojis, discord } = require("../config");

module.exports = {

    locale: "sp_SP",

    utils: {
        prefix: (prefix) => `¡Buenos dias! ¡Por favor use **${prefix}help** para ver todos los pedidos! Puedes agregarme en tu servidor con **${prefix}add**.`,
        viewConf: () => `[Ver la configuración en el dashboard](https://dash.manage-invite.xyz)`,
        conf: {
            title: () => `Ver la configuración en el dashboard`,
            content: () => `[o en el dashboard](https://dash.manage-invite.xyz)`
        },
        specialMessages: {
            join: {
                oauth2: (user) => `${user} se unió al servidor a través de OAuth.`,
                vanity: (user) => `${user} se unió al servidor usando una invitación discord.gg definida por el propietario del servidor (o un administrador).`,
                unknown: (user) => `No puedo entender como ${user} se unió al servidor.`,
                perm: (user) => `${emojis.error} | Necesito tener permisos para administrar el servidor para saber quién invitó ${user}.`
            },
            leave: {
                oauth2: (user) => `${user.tag} dejó el servidor, se unió a través de OAuth.`,
                vanity: (user) => `${user.tag} dejó el servidor, se unió usando una invitación discord.gg definida por el propietario del servidor (o un administrador).`,
                unknown: (user) => `${user.tag} dejó el servidor, pero no puedo entender cómo se unió a él.`
            }
        }
    },

    errors: {
        missingPerms: (neededPermissions) => `__**${emojis.error} Permisos faltantes**__\n\nNecesito los siguientes permisos para el correcto funcionamiento de este comando: ${neededPermissions.map((p) => "`"+p+"`").join(", ")}`,
        disabled: () => `${emojis.error} | ¡Este comando está actualmente deshabilitado!`,
        permLevel: (name) => `${emojis.error} | ¡Este comando requiere el nivel de autorización: \`${name}\`!`,
        sendPerm: () => `${emojis.error} | ¡No tengo permiso para enviar mensajes en esta sala!`
    },

    help: {
        title: () => `ℹ Página de ayuda de ManageInvite`,
        description: (guildName, prefix) => `> Prefijo en ${guildName} : **${prefix}** (\`${prefix}setprefix\`)\n> Idioma en ${guildName} : **Spanish** (\`${prefix}setlang\`)`,
        // Admin
        admin: {
            title: () => `Administrador`,
            content: (prefix) => `
        > **${prefix}blacklist [agregar/eliminar/lista] (@usuario)**: Agregar/eliminar miembro a la lista negra
        > **${prefix}addbonus numero @usuario**: Agregar invitaciones adicionales a un miembro
        > **${prefix}removebonus numero @usuario**: Retirar invitaciones de bonificación a un miembro
        > **${prefix}sync-invites**: Sincronizar invitaciones de bot con invitaciones de servidor
        > **${prefix}removeinvites (@usuario)**: Eliminar invitaciones (servidor/miembro)
        > **${prefix}restoreinvites (@usuario)**: Restaura invitaciones (servidor/miembro)`
        },
        // Ranks
        ranks: {
            title: () => `Rol de recompensas`,
            content: (prefix) => `
        > **${prefix}addrank numero @rol**: Agregar un rol de recompensa
        > **${prefix}removerank @rol**: Retirar un rol de recompensa
        > **${prefix}ranks**: Lista de roles de recompensa
        > **${prefix}setkeep-ranks**: Configure la configuración "keep-ranks"`
        },
        // Join DM Messages
        joinDM: {
            title: () => `Mensajes de llegada en MP`,
            content: (prefix) => `
        > **${prefix}configdm**: Configurar mensajes __**de llegada en mp**__
        > **${prefix}setdm**: Deshabilitar/Habilitar mensajes __**de llegada en mp**__
        > **${prefix}testdm**: Mensajes de prueba __**de llegada en mp**__`
        },
        // Join Messages
        join: {
            title: () => `Mensajes de llegada`,
            content: (prefix) => `
        > **${prefix}configjoin**: Configurar mensajes __**de llegadas**__
        > **${prefix}setjoin**: Deshabilitar/Habilitar mensajes __**de llegadas**__
        > **${prefix}testjoin**: Mensajes de prueba __**de llegadas**__`
        },
        // Leave Messages
        leave: {
            title: () => `Mensajes de salida`,
            content: (prefix) => `
        > **${prefix}configleave**: Configurar mensajes de __**salidas**__
        > **${prefix}setleave**: Deshabilitar / Habilitar mensajes de __**salidas**__
        > **${prefix}testleave**: Mensajes de prueba de __**salidas**__`
        },
        // Invites
        invites: {
            title: () => `Invitaciones`,
            content: (prefix) => `
        > **${prefix}invite (@usuario)**: Registre la cantidad de invitaciones que tiene o que mencione al miembro.
        > **${prefix}leaderboard**: Muestra la clasificación de las invitaciones del servidor.`,
        },
        // ManageInvite
        manageInvite: {
            title: () => `ManageInvite`,
            content: (prefix) => `
        > **${prefix}botinfos**: Muestra información sobre ManageInvite.
        > **${prefix}ping**: Muestra el ping de ManageInvite.
        > **${prefix}partners**: Muestra los socios de ManageInvite.
        > **${prefix}support**: Únase al servidor de soporte.
        > **${prefix}stats**: Ver las estadísticas de llegada de su servidor.
        > **${prefix}add**: Agrégame a tu servidor.`
        },
        // Others
        tip: (prefix) => `Consejo: puedes ver tu configuración con el comando ${prefix}config`,
        links: (clientID) => `[Agrégame a tu servidor](https://discordapp.com/api/oauth2/authorize?client_id=${clientID}&permissions=8&scope=bot) | [Servidor de soporte](${discord}) | [Vota por mi](https://top.gg/bot/${clientID})`
    },

    botinfos: {
        author: (username) => `Estadísticas de ${username}`,
        // Statistics
        statistics: {
            title: () => `📊 Estadísticas`,
            content: (guilds, users) => `\`Servidores: ${guilds}\`\n\`Los usuarios: ${users}\``
        },
        // Versions
        versions: {
            title: () => `⚙️ Versiones`,
            content: (djs, node) => `\`Discordia: v${djs}\`\n\`Nodo: ${node}\``
        },
        // Shard
        shard: {
            title: (shardID, current) => `${emojis.online} Shard #${shardID} ${current ? `(corriente)` : ""}`,
            content: (guilds, ping, ram, cachedMembers, cachedGuilds) => `
            \`${guilds}\` Servidores
            \`${ping}\` ms
            \`${ram}\` mb ram
            \`${cachedMembers}\` miembros en caché
            \`${cachedGuilds}\` Servidores en caché`,
        }
    },

    invite: {
        description: (member, memberData, isYou, nextRank, role) => `${isYou ? `Teneis` : `**${member.user.username}** una`} **${memberData.regular + memberData.bonus - memberData.leaves - memberData.fake}** invitaciones! (**${memberData.regular}** ordinario, **${memberData.bonus}** bono, **${memberData.fake > 0 ? `-${memberData.fake}` : `${memberData.fake}`}** falso, **${memberData.leaves > 0 ? `-${memberData.leaves}` : `${memberData.leaves}`}** ido)${nextRank ? `\n¡Todavia necesitas **${nextRank.inviteCount - (memberData.regular + memberData.bonus - memberData.leaves - memberData.fake)}** invitaciones para llegar a grado **${role}** !` : ""}`
    },

    leaderboard: {
        cleared: () => `${emojis.success} | Clasificación borrada !`,
        user: (user, member, lb) => `${lb} **${user.username}** - **${member.calculatedInvites}** invitaciones (**${member.regular}** ordinario, **${member.bonus}** bono, **${member.fake > 0 ? `-${member.fake}` : `${member.fake}`}** falso, **${member.leaves > 0 ? `-${member.leaves}` : `${member.leaves}`}** ido)`,
        prompt: () => `¿{{user}}, a qué página quieres ir? Écrivez \`cancel\` or \`0\` para cancelar.`,
        title: () => `Clasificación de invitaciones.`,
        empty: {
            title: () => `😕 No se encontró ninguna invitación.`,
            content: () => `¡Empieza a invitar personas y aparecerás en esta página!`
        }
    },

    userinfo: {
        title: (user) => `Cuenta ${user.tag} (${user.id})`,
        fields: {
            // user
            createdAt: {
                title: () => `Creación`
            },
            bot: {
                title: () => `Robot`,
                content: (user) => user.bot ? "Si" : "No"
            },
            // member
            joinedAt: {
                title: () => `Llegada`
            },
            joinWay: {
                title: () => `Llegada gracias a`,
                oauth: () => `Invitación oauth2 (a través de discordapp.com).`,
                vanity: () => `Invitación personalizada configurada por un administrador.`,
                unknown: (user) => `Incapaz de determinar cómo ${user.username} se unió al servidor.`,
                invite: (user) => user.tag
            },
            invites: {
                title: () => `Invitaciones`,
                content: (inviteData) => `**${inviteData.regular + inviteData.bonus - inviteData.leaves - inviteData.fake}** invitaciones (**${inviteData.regular}** ordinario, **${inviteData.bonus}** bono, **${inviteData.fake > 0 ? `-${inviteData.fake}` : `${inviteData.fake}`}** falso, **${inviteData.leaves > 0 ? `-${inviteData.leaves}` : `${inviteData.leaves}`}** ido)`
            },
            joinOrder: {
                title: () => `Orden de llegadas`,
                content: (previous, next, user) => `${previous ? `**${previous.tag}** > ` : ""}**${user.tag}**${next ? ` > **${next.tag}**` : ""}`
            },
            invitedUsers: {
                title: () => `Miembros invitados`,
                content: (users, andMore, nobody) => nobody ? "No hay miembros invitados" : andMore ? `${users.join(", ")}, y más...` : users.join(", ")
            }
        }
    },

    membercount: {
        title: (guildName) => `Miembro Cantidad de ${guildName}`,
        description: (guild) => `
        Un total de **${guild.members.cache.size}** miembros (**${guild.members.cache.filter((m) => !m.user.bot).size}** humanos y **${guild.members.cache.filter((m) => m.user.bot).size}** bots)
        ➔ ${emojis.dnd} | ${guild.members.cache.filter((m) => m.presence.status === "dnd"  && !m.user.bot).size} miembros (no molestar)
        ➔ ${emojis.online} | ${guild.members.cache.filter((m) => m.presence.status === "online" && !m.user.bot).size} miembros (en línea)
        ➔ ${emojis.idle} | ${guild.members.cache.filter((m) => m.presence.status === "idle" && !m.user.bot).size} miembros (afk)
        ➔ ${emojis.offline} | ${guild.members.cache.filter((m) => m.presence.status === "offline" && !m.user.bot).size} miembros (sin conexión)`
    },

    support: {
        content: () => `:information_source: Si tiene alguna pregunta o necesita más información, puede comunicarse con ManageInvite's Lounge :\n${discord}`
    },

    addbonus: {
        errors: {
            bonus: {
                missing: (prefix) => `${emojis.error} | Debe escribir la cantidad de invitaciones adicionales que desea agregar. (Sintaxis: ${prefix}addbonus numero @miembro)`,
                incorrect: (prefix) => `${emojis.error} | Debes escribir un numero __**valido**__ invitaciones adicionales que desea agregar. (Sintaxis: ${prefix}addbonus numero @miembro)`
            },
            member: {
                missing: (prefix) => `${emojis.error} | Debe mencionar al miembro al que desea agregar las invitaciones de bonificación. (Syntaxe : ${prefix}addbonus numero @miembro)`
            }
        },
        title: () => `📥 Invitaciones de bonificación añadidas`,
        field: (prefix, member) => `¡Escribir \`${prefix}invites ${member.user.tag}\` para ver la nueva cantidad de invitaciones de **${member.user.username}** !`
    },

    blacklist: {
        blacklisted: () => `${emojis.error} | ¡Estás en la lista negra de este servidor, ¡no puedes escribir este comando!`,
        blacklistedMember: (member) => `${member.user.tag} está en la lista negra de este servidor.`,
        action: {
            error: () => `${emojis.error} | ¡Debes ingresar una acción válida! (\`add\`, \`remove\` ou \`list\`)\n\n:information_source: Usuarios de la lista negra:\n- Ya no recibirá/perderá roles\n- Ya no aparecerá en la tabla de clasificación\n- Ya no se rastrearán sus invitaciones\n- No podrá escribir el comando \`invites\``
        },
        mentions: {
            add: () => `${emojis.error} | ¡Debe mencionar un miembro válido para agregar a la lista negra!`,
            remove: () => `${emojis.error} | ¡Debe mencionar un miembro válido para ser eliminado de la lista negra!`
        },
        success: {
            add: (user) => `${emojis.success} | ¡**${user.tag}** ha sido añadido a la lista negra!`,
            remove: (user) => `${emojis.success} | ¡**${user.tag}** ha sido eliminado de la lista negra!`
        },
        empty: () => `¡Ningún usuario en la lista negra!`,
        notFound: (user) => `${emojis.error} | ¡**${user.tag}** no está en la lista negra!`
    },

    removebonus: {
        errors: {
            bonus: {
                missing: (prefix) => `${emojis.error} | Debe indicar la cantidad de invitaciones adicionales que desea retirar. (Sintaxis: ${prefix}removebonus numero @miembro)`,
                incorrect: (prefix) => `${emojis.error} | Debes escribir un __**válido**__ cantidad de invitaciones adicionales que desea eliminar. (Sintaxis: ${prefix}removebonus numero @miembro)`
            },
            member: {
                missing: (prefix) => `${emojis.error} | Debe mencionar al miembro del que desea eliminar las invitaciones de bonificación. (Sintaxis : ${prefix}removebonus numero @miembro)`
            }
        },
        title: () => `📥 Invitaciones de bonificación retiradas`,
        field: (prefix, member) => `Escribir \`${prefix}invites ${member.user.tag}\` para ver la nueva cantidad de invitaciones de **${member.user.username}** !`
    },

    setdmjoin: {
        on: () => `**${emojis.success} | El sistema de mensajes de llegada en mp es ahora __ACTIVADO__ !**`,
        off: () => `**${emojis.success} | El sistema de mensajes de llegada en mp es ahora __DESACTIVAR__ !**`
    },

    setjoin: {
        on: () => `**${emojis.success} | El sistema de mensajes de llegada es ahora __ACTIVADO__ !**`,
        off: () => `**${emojis.success} | El sistema de mensajes de llegada es ahora __DESACTIVAR__ !**`
    },

    setleave: {
        on: () => `**${emojis.success} | El sistema de mensajes de partida es ahora __ACTIVADO__ !**`,
        off: () => `**${emojis.success} | El sistema de mensajes de partida es ahora __DESACTIVAR__ !**`
    },

    setkeepranks: {
        premium: (username) => `:crown: | ¡Oye, **${username}** ! Esta función solo está disponible para servidores y socios premium. ¡Hazte premium aquí: **<https://docs.manage-invite.xyz/configuration/premium>** !`,
        on: () => `**${emojis.success} | ¡Ahora los miembros __mantendrá__ sus roles, incluso si no tienen suficientes invitaciones!**`,
        off: () => `**${emojis.success} | ¡Ahora los miembros __no mantendrá__ no son sus roles si no tienen suficientes invitaciones!**`
    },

    setprefix: {
        missing: () => `${emojis.error} | ¡Debes escribir un prefijo!`,
        success: () => `${emojis.success} | ¡El prefijo del servidor ha sido actualizado!`
    },

    testdmjoin: {
        title: () => `:wrench: Sistema de mensajes de llegada en MP:`,
        description: () => `Si eso no funciona, verifique los permisos del bot o únase a nuestro [servidor de soporte](${discord})`,
        fields: {
            enabled: () => `> Activado:`,
            message: () => `> Mensaje:`
        },
        enabled: (prefix) => `${emojis.success} Mensajes de llegada en MP activados. Desactivarlos con \`${prefix}setdmjoin\`.`,
        disabled: (prefix) =>  `${emojis.error} Mensajes de llegada en mp desactivados Actívalos con \`${prefix}setdmjoin\`.`,
        notDefineds: {
            message: (prefix) => `No hay mensaje definido. ¡Defínalo con \`${prefix}configdm\`!`
        }
    },

    testjoin: {
        title: () => `:wrench: Sistema de mensajes de llegada :`,
        description: () => `Si eso no funciona, verifique los permisos del bot o únase a nuestro [servidor de soporte](${discord})`,
        fields: {
            enabled: () => `> Activado:`,
            channel: () => `> Canal:`,
            message: () => `> Mensaje:`
        },
        enabled: (prefix) => `${emojis.success} Mensajes de llegada activados. Desactivarlos con \`${prefix}setjoin\`.`,
        disabled: (prefix) =>  `${emojis.error} Messages d'arrivées désactivés. Activez-les avec \`${prefix}setjoin\`.`,
        notDefineds: {
            message: (prefix) => `No hay mensaje definido. Defínalo con \`${prefix}configjoin\`!`,
            channel: (prefix) => `No hay salón definido. Defínalo con \`${prefix}configjoin\`!`
        }
    },

    testleave: {
        title: () => `:wrench: Sistema de mensajes de salida:`,
        description: () => `Si eso no funciona, verifique los permisos del bot o únase a nuestro [servidor de soporte](${discord})`,
        fields: {
            enabled: () => `> Activado:`,
            channel: () => `> Canal:`,
            message: () => `> Mensaje:`
        },
        enabled: (prefix) => `${emojis.success} Mensajes de salida activados. Desactivarlos con \`${prefix}setleave\`.`,
        disabled: (prefix) =>  `${emojis.error} Mensajes de salida deshabilitados. Actívalos con \`${prefix}setleave\`.`,
        notDefineds: {
            message: (prefix) => `No hay mensaje definido. ¡Defínalo con \`${prefix}configleave\`!`,
            channel: (prefix) => `No hay salón definido. ¡Defínalo con \`${prefix}configleave\`!`
        }
    },

    config: {
        title: (guildName) => `Configuración de ${guildName}`,
        join: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Mensajes de llegada`,
            content: (guild, data) => `
            > Activado: ${data.guild.join.enabled ? "**si**" : "**no**"}
            > Mensaje: ${data.guild.join.message ? "**definido**" : "**no definido**."}
            > Canal: ${!data.guild.join.channel ? "**no definido**" : (guild.channels.cache.get(data.guild.join.channel) ? "**definido**" : "**Canal no encontrado**")}`
        },
        leave: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Messages de départs`,
            content: (guild, data) => `
            > Activado: ${data.guild.leave.enabled ? "**ousii**" : "**no**"}
            > Mensaje: ${data.guild.leave.message ? "**definido**" : "**no definido**."}
            > Canal: ${!data.guild.leave.channel ? "**no definido**" : (guild.channels.cache.get(data.guild.leave.channel) ? "**definido**" : "**Canal no encontrado**")}`
        },
        joinDM: {
            title: (enabled) => `${(enabled ? emojis.success : emojis.error)} Mensajes de llegada en MP`,
            content: (guild, data) => `
            > Activado: ${data.guild.joinDM.enabled ? "**si**" : "**no**"}
            > Mensaje: ${data.guild.joinDM.message ? "**definido**" : "**no definido**."}`
        },
    },

    joinDM: {
        premium: (username) => `:crown: | ¡Oye, **${username}** ! Esta función solo está disponible para servidores y socios premium. ¡Hazte premium aquí: **<https://docs.manage-invite.xyz/configuration/premium>** !`
    },

    configdmjoin: {
        disable: (prefix) => `Tipo \`${prefix}setdmjoin\` para desactivar los mensajes de llegada en MP.`,
        instruct: (str) => `
__**Más información**__
\`\`\`
{user} : Mencione al miembro que acaba de unirse a su servidor.
{user.name} : El apodo del miembro que acaba de unirse a su servidor.
{user.tag} : La etiqueta del miembro que acaba de unirse a su servidor.
{user.createdat} : La edad de la cuenta del miembro.
{user.id} : La identificación del miembro.
{guild} : Nombre del servidor
{guild.count} : Número de miembros que tiene ahora su servidor.
{inviter} : Mencione al invitador.
{inviter.name} : El nombre del invitador.
{inviter.tag} : La etiqueta del invitado.
{inviter.invites} : El número total de invitaciones del invitador.
{inviter.id} : La identificación de la invitador.
{invite.code} : El código de invitación utilizado.
{invite.url} : La URL de invitación utilizada.
{invite.uses} : Número de veces que se usó el código de invitación.
\`\`\`
Tipo \`cancel\` para cancelar. ${str}
:pencil: **| Ahora escriba el mensaje de llegada en MP... :pencil2:**`,
        cancelled: () => `${emojis.error} | Cancelado.`,
        success: () => `${emojis.success} **| Completado con éxito...**`,
        title: () => `**Mensaje de Llegadas en MP ha sido implementado**`,
        fields: {
            message: () => `Mensaje:`,
            testIt: () => `Pruébalo:`,
            cmd: (prefix) => `Uso \`${prefix}testdmjoin\` para probar el nuevo mensaje.`
        },
    },

    configjoin: {
        disable: (prefix) => `Uso \`${prefix}setjoin\` para desactivar los mensajes de llegada.`,
        instructs: {
            message: (str) => `
__**Más información**__
\`\`\`
{user} : Mencione al miembro que acaba de unirse a su servidor.
{user.name} : El apodo del miembro que acaba de unirse a su servidor.
{user.tag} : La etiqueta del miembro que acaba de unirse a su servidor.
{user.createdat} : La edad de la cuenta del miembro.
{user.id} : La identificación del miembro.
{guild} : Nombre del servidor
{guild.count} : Número de miembros que tiene ahora su servidor.
{inviter} : Mencione al invitador.
{inviter.name} : El nombre del invitador.
{inviter.tag} : La etiqueta del invitado.
{inviter.invites} : El número total de invitaciones del invitador.
{inviter.id} : La identificación de la invitador.
{invite.code} : El código de invitación utilizado.
{invite.url} : La URL de invitación utilizada.
{invite.uses} : Número de veces que se usó el código de invitación.
\`\`\`
Tipo \`cancel\` para cancelar. ${str}
:pencil: **| Ahora escribe el mensaje de llegada... :pencil2:**`,
            channel: () => `:scroll: **| Ahora escriba el nombre de la habitación en los mensajes de llegada o menciónelo... :pencil2:**`
        },
        cancelled: () => `${emojis.error} | Cancelado.`,
        success: () => `${emojis.success} **| Completado con éxito...**`,
        title: () => `**El mensaje de llegadas ha sido configurado**`,
        fields: {
            message: () => `Mensaje:`,
            channel: () => `Canal:`,
            testIt: () => `Pruébalo:`,
            cmd: (prefix) => `Uso \`${prefix}testjoin\` para probar el nuevo mensaje.`
        },
        errors: {
            channelNotFound: (channel) => `${emojis.error} | No se encontró salón para \`${channel}\``
        }
    },

    configleave: {
        disable: (prefix) => `Uso \`${prefix}setleave\` para desactivar los mensajes de salida.`,
        instructs: {
            message: (str) => `
__**Más información**__
\`\`\`
{user} : Mencione al miembro que acaba de llegar de su servidor.
{user.name} : El apodo del miembro que acaba de llegar de su servidor.
{user.tag} : La etiqueta del miembro que acaba de llegar de su servidor.
{user.createdat} : La edad de la cuenta del miembro.
{user.id} : La identificación del miembro.
{guild} : Nombre del servidor
{guild.count} : Número de miembros que tiene ahora su servidor.
{inviter} : Mencione al invitador.
{inviter.name} : El nombre del invitador.
{inviter.tag} : La etiqueta del invitado.
{inviter.invites} : El número total de invitaciones del invitador.
{inviter.id} : La identificación de la invitador.
{invite.code} : El código de invitación utilizado.
{invite.url} : La URL de invitación utilizada.
{invite.uses} : Número de veces que se usó el código de invitación.
\`\`\`
Tipo \`cancel\` para cancelar. ${str}
:pencil: **| Ahora escribe el mensaje de salida... :pencil2:**`,
        channel: () => `:scroll: **| Ahora escriba el nombre de la sala de mensajes de salida o menciónelo... :pencil2:**`
        },
        cancelled: () => `${emojis.error} | Cancelado.`,
        success: () => `${emojis.success} **| Hecho correctamente...**`,
        title: () => `**El mensaje de salidas ha sido configurado**`,
        fields: {
            message: () => `Mensaje:`,
            channel: () => `Cala:`,
            testIt: () => `Pruébalo:`,
            cmd: (prefix) => `Uso \`${prefix}testleave\` para probar el nuevo mensaje`
        },
        errors: {
            channelNotFound: (channel) => `${emojis.error} | No se encontró salón para \`${channel}\``
        }
    },

    setlang: {
        invalid: () => `${emojis.error} | ¡Debes ingresar un idioma válido!\n\n:flag_fr: Français (\`fr\`)\n:flag_gb: English (\`en\`)\n:flag_es: Spanish (\`sp\`)`,
        success: () => `${emojis.success} | ¡Idioma actualizado!`
    },

    addrank: {
        errors: {
            inviteCount: {
                missing: (prefix) => `${emojis.error} | Debe escribir la cantidad de invitaciones necesarias para obtener la calificación. (Sintaxis: ${prefix}addrank numero @role)`,
                incorrect: (prefix) => `${emojis.error} | Debe escribir un número __**válido**__ de invitaciones necesarias para obtener la calificación.. (Sintaxis : ${prefix}addrank numero @role)`,
                alreadyExists: (prefix, rank, role) => `${emojis.error} | ¡Ya hay un rol definido para **${rank.inviteCount}** invitaciones (\`@${role.name}\`) ! ¡Eliminarlo con \`${prefix}removerank ${role.id}\` entonces inténtalo de nuevo!`
            },
            role: {
                missing: (prefix) => `${emojis.error} | Debe mencionar la función que desea agregar cuando se alcanza la cuota de invitación. (Sintaxis : ${prefix}addrank numero @role)`,
                alreadyExists: (prefix, rank, role) => `${emojis.error} | ¡Este rol ya se utiliza como recompensa por **${rank.inviteCount}** invitaciones! ¡Eliminarlo con \`${prefix}removerank ${role.id}\` luego intente nuevamente !`,
                perm: (role) => `${emojis.error} | ¡Mi rol no es lo suficientemente alto como para agregar el rol \`@${role.name}\` a los miembros! ¡Por favor monta mi rol e inténtalo de nuevo !`
            }
        },
        title: () => `🎯 Nuevo rol agregado`,
        field: (prefix, role, inviteCount) => `¡Cuando un miembro alcanza **${inviteCount}** invitaciones recibirá el papel \`@${role.name}\` !`
    },

    removerank: {
        errors: {
            role: {
                missing: (prefix) => `${emojis.error} | Debe mencionar el rol que desea retirar. (Sintaxis: ${prefix}removerank @role)`,
                doesntExist: () => `${emojis.error} | ¡Este rol no se usa para recompensas!`
            }
        },
        title: () => `🎯 Rol retirado`,
        field: (prefix, role, inviteCount) => `Rol eliminado de los premios. Los miembros ya no lo recibirán cuando lleguen al **${inviteCount}** invitaciones`
    },

    ranks: {
        no: {
            title: () => `🎯 Sin papel`,
            description: (prefix) => `Para agregar un rol de recompensa (agregado cuando un miembro alcanza un cierto número de invitaciones), escriba \`${prefix}addrank numero @role\` !`
        },
        title: () => `🎯 Roles de recompensa`,
        formatRank: (rank, inviteCount) => `${rank} (**${inviteCount}** invitaciones)\n`
    },

    website: {
        doc: {
            variables: () => `https://docs.manage-invite.xyz/v/francais/configuration/variables`
        },
        utils: {
            members: () => `miembros`
        },
        conf: {
            title: () => `Configuracion`
        },
        selector: {
            title: () => `Selector`,
            manage: () => `Administrar`,
            no: {
                title: () => `Sin servidor`,
                content: () => `No se encontraron servidores. ¡Verifique que haya iniciado sesión con la cuenta correcta!`
            }
        },
        help: {
            title: () => `Ayuda`,
            doc: () => `Documentación`,
            support: () => `Servidor de soporte`
        },
        ranks: {
            title: () => `🎯 Rol de recompensas`,
            no: (prefix) => `Sin rol de recompensa definido. Puede configurarlos con los siguientes comandos: ${prefix}addrank, ${prefix}removerank y ${prefix}ranks.`,
            fields: {
                role: () => `Rol`,
                invites: () => `Invitaciones`
            }
        },
        forms: {
            buttons: {
                enable: () => `Activar mensajes`,
                disable: () => `Deshabilitar mensajes`,
                update: () => `Actualizar mensajes`
            },
            basic: {
                title: () => `⚙️ Configuración básica`,
                language: () => `Lengua`,
                prefix: () => `Prefijo`,
                update: () => `Poner al día`
            },
            join: {
                title: () => `🏁 Mensajes de llegada`,
                message: {
                    title: () => `Mensajes`,
                    default: () => `¡{user} se unió al servidor! Fue invitado por **{inviter.tag}** (quien tiene **{inviter.invites}** invitaciones).`
                },
                channel: {
                    title: () => `Canal`
                }
            },
            leave: {
                title: () => `🛫 Mensajes de salida`,
                message: {
                    title: () => `Mensajes`,
                    default: () => `{user.tag} ha dejado el servidor Había sido invitado por **{inviter.tag}** (quien tiene **{inviter.invites}** invitaciones).`
                },
                channel: {
                    title: () => `Canal`
                }
            },
            joinDM: {
                title: () => `🔔 Mensajes de llegada en MP`,
                premium: () => `Funcionalidad disponible para servidores premium y socios.`,
                message: {
                    title: () => `Mensajes`,
                    default: () => `¡Bienvenido {user} sobre **{server} ! Fuiste invitado por  **{inviter.tag}**. ¡No olvides leer las reglas del servidor!`
                }
            }
        }
    },

    removeinvites: {
        loading: {
            all: (prefix) => `${emojis.loading} | Eliminando invitaciones del servidor ... ¡Puede restaurarlas con el comando \`${prefix}restore-invites\` !`,
            member: (prefix, member) => `${emojis.loading} | Eliminar invitaciones de **${member.user.tag}** en progreso ... ¡Puede restaurarlos usando el comando \`${prefix}restore-invites ${member.user.tag}\` !`
        },
        title: () => `☄️ Restablecimiento de invitaciones`,
        titles: {
            all: (prefix) => `${emojis.success} | ¡Invitaciones de servidor reiniciadas! Puedes restaurarlos usando el comando \`${prefix}restore-invites\` !`,
            member: (prefix, member) => `${emojis.success} | ¡Invitaciones de **${member.user.tag}** reinitalizado ! ¡Puedes restaurarlos con el comando \`${prefix}restore-invites ${member.user.tag}\` !`
        }
    },

    restoreinvites: {
        confirmations: {
            all: (prefix, memberCount) => `${emojis.warn} | ¿Seguro que quieres restaurar las invitaciones del servidor? Todos los miembros recibirán las invitaciones que tenían antes de la última vez que hicieron el pedido \`${prefix}remove-invites\` se ha escrito (o 0 si el comando nunca se ha escrito).\n\n:information_source: **Resumen de invitaciones**:\nSerá restaurado, en total: **${memberCount.regular}** ordinario, **${memberCount.bonus}** bono, **${memberCount.leaves}** ido, **${memberCount.fake}** falso.\n\n${emojis.success} Tipo \`-confirm\` v.\n${emojis.error} Tipo \`cancel\` para cancelar.`,
            member: (prefix, member) => `${emojis.warn} | ¿Está seguro de que desea restaurar las invitaciones de **${member.user.tag}** ? Recuperará las invitaciones que tenía antes de la última vez que realizó el pedido. \`${prefix}remove-invites\` se ha escrito (o 0 si el comando nunca se ha escrito).\n\n:information_source: **Resumen de invitaciones**:\nSerá restaurado: **${member.data.regular}** ordinario, **${member.data.bonus}** bono, **${member.data.leaves}** ido, **${member.data.fake}** falso.\n\n${emojis.success} Tipo \`-confirm\` por confirmar.\n${emojis.error} Tipo \`cancel\` para cancelar.`,
            cancelled: () => `${emojis.error} Cancelado.`
        },
        loading: {
            all: () => `${emojis.loading} | Restaurando invitaciones del servidor ...`,
            member: (member) => `${emojis.loading} | Restauración de invitaciones **${member.user.tag}** en curso...`
        },
        title: () => `☄️ Invitaciones restauradas`,
        titles: {
            all: () => `${emojis.success} | ¡Invitaciones del servidor restauradas!`,
            member: (member) => `${emojis.success} | ¡Invitaciones de **${member.user.tag}** restaurado !`
        }
    },

    syncinvites: {
        no: () => `${emojis.error} | No hay invitación para sincronizar disponible.`,
        confirmations: {
            all: (inviteCount) => `${emojis.warn} | ¿Seguro que quieres sincronizar las invitaciones del servidor?\n\n:information_source: **Resumen de invitaciones**:\nSerá restaurado **${inviteCount}** invitaciones ordinarias.\n\n${emojis.success} Tipo \`-confirm\` por confirmar.\n${emojis.error} Tipo \`cancel\` para cancelar.`,
            cancelled: () => `${emojis.error} Cancelado.`
        },
        title: () => `☄️ Invitaciones sincronizadas`,
        titles: {
            all: () => `${emojis.success} | ¡Invitaciones de servidor sincronizadas!`
        }
    },

    add: {
        content: (id) => `Puedes agregarme a tu servidor haciendo clic [aquí](https://discordapp.com/oauth2/authorize?client_id=${id}&scope=bot&permissions=2146958847).`,
        requested: (username) => `Solicitado por ${username}`
    },

    stats: {
        title: (name, nb) => `Llegadas el ${name} estos ${nb} últimos días`,
        content: (total, percent, days) => `**${total}** miembros (cualquiera **${percent}%** del servidor) se unió al servidor de la ${days[0]} a las ${days[1]} :`,
        premium: (username) => `:crown: | ¡Oye, **${username}** ! Esta funcionalidad (período de estadísticas personalizadas) está disponible solo para servidores y socios premium. ¡Hazte premium aquí: **<https://docs.manage-invite.xyz/configuration/premium>** !`,
        errors: {
            invalid: () => `${emojis.error} | ¡Debe ingresar un número válido de días (mayor que 1 y menor que 1000) para mostrar!`
        }
    },

    monthIndex: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

};
