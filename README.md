<img width="150" height="150" style="float: left; margin: 0 10px 0 0;" alt="ManageInvite" src="./assets/logo.png">  

# ManageInvite
[![version](https://img.shields.io/github/package-json/v/Androz2091/ManageInvite?style=for-the-badge)](https://github.com/Androz2091/ManageInvite)
[![discord](https://img.shields.io/discord/638685268777500672?style=for-the-badge&color=7289DA&label=Discord)](https://discord.gg/v26Sqqs)
[![patreon](https://img.shields.io/endpoint.svg?url=https://shieldsio-patreon.herokuapp.com/Androz2091&style=for-the-badge)](https://patreon.com/Androz2091)
[![issues](https://img.shields.io/github/issues/Androz2091/ManageInvite?style=for-the-badge)](https://github.com/Androz2091/ManageInvite)

> ManageInvite is used by + 2,000,000 users in + 10,000 servers!

## How can I install the bot?

The code in this repository is **NOT** intended to be hosted. Some parts of the code are missing and the bot can't work only with these files. This code is open source because it's the heart of ManageInvite and we think it's important to share the biggest part of our code.
We're sorry but we won't be able to help you to install the bot on your own server and we're sorry if you wasted your time trying before coming across this message...

## 🌐 Dashboard

ManageInvite has a powerful dashboard which allows you to manage your servers easily! Configure join/leave messages, change server prefix, server language, etc...

<img src="./assets/selector.png" style="margin-right: 2px;width: 40%;" ></img>
<img src="./assets/manage.png" style="margin-right: 2px;width: 40%;" ></img>

## 💪 Features

> **ManageInvite** has a total of 34 commands!

### ⚙️ Config commands

```
+configjoin          Config join messages
+setjoin             Disable/Enabled join messages
+testjoin            Try join messages configuration
```


```
+configdm            Config join messages in dm
+setdm               Disable/Enabled join messages in dm
+testdm              Try join messages in dm configuration
```

```
+configleave         Config leave messages
+setleave            Disable/Enabled leave messages
+testleave           Try leave messages configuration
```

You can use `+config` to show your servers global config.

### 🔑 Admin commands

```
+set-stacked-ranks   Whether members keep all their roles or only the highest one
+set-keep-ranks      Whether members keep their roles when they lose invites
+blacklist           Add or remove a user to the blacklist
```

```
+addbonus            Add bonus invites to a member.
+removebonus         Remove bonus invites from a member.
```

```
+addrank             Add a rank to the rank rewards.
+removerank          Remove a rank from the rank rewards.
+ranks               Show the rank rewards list.
```

```
+removeinvites       Clear member or server invites.
+restoreinvites      Restore member or server invites.
+sync-invites        Synchronize ManageInvite database with server invites.
```

### 👤 User commands

Everyone can use user commands, there aren't restricted.

#### Invite command

```
+invites (@user)   Show your invites or the invites of the mentionned member.
+leaderboard       Show the server leaderboard.
+stats             Show a graph with the server joins.
+membercount       Show members stats.
```

#### Infos commands

```
+help              Show the list of the commands.
+botinfos          Show informations about ManageInvite.
+ping              Show the ManageInvite's ping.
+add               Show the ManageInvite's invite link.
+support           Join the support server.
```

### 👑 Owner commands

```
+eval              Execute javascript code.
+reload            Reload a command or languages.
+servers-list      Show the servers list.
```
