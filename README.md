<img width="150" height="150" style="float: left; margin: 0 10px 0 0;" alt="ManageInvite" src="./assets/logo.png">  

# ManageInvite
[![version](https://img.shields.io/github/package-json/v/Androz2091/ManageInvite?style=for-the-badge)](https://github.com/Androz2091/ManageInvite)
[![discord](https://img.shields.io/discord/638685268777500672?style=for-the-badge&color=7289DA&label=Discord)](https://discord.gg/v26Sqqs)
[![patreon](https://img.shields.io/endpoint.svg?url=https://shieldsio-patreon.herokuapp.com/Androz2091&style=for-the-badge)](https://patreon.com/Androz2091)
[![issues](https://img.shields.io/github/issues/Androz2091/ManageInvite?style=for-the-badge)](https://github.com/Androz2091/ManageInvite)

> ManageInvite is used by +140k users in +500 servers!

## 🌐 Dashboard

ManageInvite has a powerful dashboard which allow you to manage your servers easily! Configure join/leave messages, change server prefix, server language, etc...

<img src="./assets/selector.png" style="margin-right: 2px;width: 40%;" ></img>
<img src="./assets/manage.png" style="margin-right: 2px;width: 40%;" ></img>

> The code of the dashboard is located in the dashboard folder, in this repository.

## 💪 Features

> **ManageInvite** has a total of 34 commands!

### ⚙️ Config commands

```
+configjoin        Config join messages
+setjoin           Disable/Enabled join messages
+testjoin          Try join messages configuration
```


```
+configdm          Config join messages in dm
+setdm             Disable/Enabled join messages in dm
+testdm            Try join messages in dm configuration
```

```
+configleave       Config leave messages
+setleave          Disable/Enabled leave messages
+testleave         Try leave messages configuration
```

You can use `+config` to show your server global config.

### 🔑 Admin commands

```
+addbonus          Add bonus invites to a member.
+removebonus       Remove bonus invites from a member.
```

```
+addrank           Add a rank to the rank rewards.
+removerank        Remove a rank from the rank rewards.
+ranks             Show the rank rewards list.
```

```
+removeinvites     Clear member or server invites.
+restoreinvites    Restore member or server invites.
+sync-invites      Synchronize ManageInvite database with server invites.
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
+partners          Show the ManageInvite's partners.
+add               Show the ManageInvite's invite link.
+support           Join the support server.
```

### 👑 Owner commands

```
+eval              Execute javascript code.
+reload            Reload a command or languages.
+servers-list      Show the servers list.
```

## ⬇️ Installation

* You have to install `Git` and `MongoDB`. Then, run `npm install` to install npm dependencies.

* Fill the configuration (rename the `config.sample.js` file to `config.js` and fill it).

* Run the bot with `node sharder.js`!