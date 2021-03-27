const config = require("../config");
const { Pool } = require("pg");
const inquirer = require("inquirer");

const meeg = require("./meeg");

const pool = new Pool(config.postgres);

const tasks = [
    {
        name: "Delete useless guilds",
        execute: () => {
            return pool.query(`
                DELETE FROM guilds WHERE guild_language = 'en-US' AND guild_prefix = '+' AND guild_keep_ranks = false AND guild_stacked_ranks = false;

                DELETE FROM guilds
                WHERE guild_id IN
                    (SELECT guild_id
                    FROM 
                        (SELECT guild_id,
                        ROW_NUMBER() OVER( PARTITION BY guilds
                        ORDER BY guild_id ) AS row_num
                        FROM guilds ) t
                        WHERE t.row_num > 1 );
            `);
        }
    },
    {
        name: "Add guild_id primary key",
        execute: () => {
            return pool.query(`
                ALTER TABLE guilds ADD PRIMARY KEY (guild_id);
            `);
        }
    },
    {
        name: "Delete useless members",
        execute: () => {
            return pool.query(`
                DELETE FROM members WHERE invites_regular = 0 AND invites_fake = 0 AND invites_bonus = 0 AND invites_leaves = 0
                AND old_invites_regular = 0 AND invites_fake = 0 AND invites_leaves = 0 AND invites_bonus = 0;
            `);
        }
    },
    {
        name: "Add the guild_storage_id column to the guilds table",
        execute: () => {
            return pool.query("ALTER TABLE guilds ADD COLUMN guild_storage_id character varying(12) NOT NULL DEFAULT 'foo';");
        }
    },
    {
        name: "Fill the guild_storage_id column to guilds table",
        execute: () => {
            return pool.query(`
                UPDATE guilds
                SET guild_storage_id = 'lJ5kRUem8rEm';
            `);
        }
    },
    {
        name: "Create guild_storages table",
        execute: () => {
            return pool.query(`
                CREATE TABLE guild_storages (
                    guild_id VARCHAR(32) NOT NULL,
                    storage_id VARCHAR(12) NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL
                );
            `);
        }
    },
    {
        name: "Create guild_storages pkey",
        execute: () => {
            return pool.query(`
                ALTER TABLE guild_storages ADD CONSTRAINT guild_storages_pkey PRIMARY KEY (guild_id, storage_id);
            `);
        }
    },
    {
        name: "Fill guild_storages table",
        execute: () => {
            return pool.query(`
                INSERT INTO guild_storages ( guild_id, storage_id, created_at )
                SELECT guild_id, guild_storage_id, NOW()
                FROM guilds
            `);
        }
    },
    {
        name: "Add the storage_id column to the members table",
        execute: () => {
            return pool.query(`
                ALTER TABLE members ADD COLUMN storage_id character varying(12) NOT NULL DEFAULT 'foo';
            `);
        }
    },
    {
        name: "Delete members pkey",
        execute: () => {
            return pool.query(`
                ALTER TABLE members DROP constraint members_pkey;
            `);
        }
    },
    {
        name: "Add new members pkey",
        execute: () => {
            return pool.query(`
                ALTER TABLE members ADD constraint members_pkey primary key (user_id, guild_id, storage_id);
            `);
        }
    },
    {
        name: "Fill the storage_id columns for members table",
        execute: () => {
            return pool.query(`
                UPDATE members
                SET storage_id = 'lJ5kRUem8rEm';
            `);
        }
    },
    {
        name: "Add the storage_id column to the invited_members table",
        execute: () => {
            return pool.query(`
                ALTER TABLE invited_member_events ADD COLUMN storage_id character varying(12) NOT NULL DEFAULT 'foo';
            `);
        }
    },
    {
        name: "Fill the storage_id column in invited_members table",
        execute: () => {
            return pool.query(`
                UPDATE invited_member_events
                SET storage_id = 'lJ5kRUem8rEm';
            `);
        },
        timeConfirmation: true
    },
    {
        name: "Delete old_invites_* columns in the members table",
        execute: () => {
            return pool.query(`
                ALTER TABLE members DROP column old_invites_regular;
                ALTER TABLE members DROP column old_invites_fake;
                ALTER TABLE members DROP column old_invites_bonus;
                ALTER TABLE members DROP column old_invites_leaves;
                ALTER TABLE members DROP column old_invites_backuped;
            `);
        }
    },
    {
        name: "Delete weird values for bonus invites...",
        execute: () => {
            return pool.query(`
                DELETE FROM members
                WHERE invites_bonus < -100000
                OR invites_bonus > 100000
            `);
        }
    },
    {
        name: "Change invite_bonus column type",
        execute: () => {
            return pool.query(`
                ALTER TABLE members ALTER COLUMN invites_bonus TYPE INT;
            `);
        }
    },
    {
        name: "Delete useless guild plugins",
        execute: () => {
            return pool.query(`
                DELETE FROM guild_plugins

                WHERE plugin_data = '{
                    "enabled": false,
                    "message": null
                }'
                OR plugin_data = '{
                    "channel": null,
                    "enabled": false,
                    "message": null
                }';

                DELETE FROM guild_plugins T1
                    USING   guild_plugins T2
                WHERE   T1.ctid < T2.ctid 
                    AND T1.guild_id = T2.guild_id 
                    AND T1.plugin_name  = T2.plugin_name;
            `);
        }
    },
    {
        name: "Create guild plugins unique constraint",
        execute: () => {
            return pool.query(`
                ALTER TABLE guild_plugins
                ADD UNIQUE (guild_id, plugin_name);
            `);
        }
    },
    {
        name: "Delete useless guild blacklisted users",
        execute: () => {
            return pool.query(`
                DELETE FROM guild_blacklisted_users T1
                    USING   guild_blacklisted_users T2
                WHERE   T1.ctid < T2.ctid 
                    AND T1.guild_id = T2.guild_id 
                    AND T1.user_id  = T2.user_id;
            `);
        }
    },
    {
        name: "Create guild blacklisted users unique constraint",
        execute: () => {
            return pool.query(`
                ALTER TABLE guild_blacklisted_users
                ADD UNIQUE (guild_id, user_id);
            `);
        }
    },
    {
        name: "Delete useless guild ranks users",
        execute: () => {
            return pool.query(`
                DELETE FROM guild_ranks T1
                    USING   guild_ranks T2
                WHERE   T1.ctid < T2.ctid 
                    AND T1.guild_id = T2.guild_id 
                    AND T1.role_id  = T2.role_id;
            `);
        }
    },
    {
        name: "Create guild ranks unique constraint",
        execute: () => {
            return pool.query(`
                ALTER TABLE guild_ranks
                ADD UNIQUE (guild_id, role_id);
            `);
        }
    },
    {
        name: "Delete useless guild subscriptions",
        execute: () => {
            return pool.query(`
                DELETE FROM guilds_subscriptions T1
                    USING   guilds_subscriptions T2
                WHERE   T1.ctid < T2.ctid 
                    AND T1.guild_id = T2.guild_id 
                    AND T1.sub_id  = T2.sub_id;
            `);
        }
    },
    {
        name: "Create guild subscriptions unique constraint",
        execute: () => {
            return pool.query(`
                ALTER TABLE guilds_subscriptions
                ADD UNIQUE (guild_id, sub_id);
            `);
        }
    },
    {
        name: "Delete useless subscriptions payments",
        execute: () => {
            return pool.query(`
                DELETE FROM subscriptions_payments T1
                    USING   subscriptions_payments T2
                WHERE   T1.ctid < T2.ctid 
                    AND T1.payment_id = T2.payment_id 
                    AND T1.sub_id  = T2.sub_id;
            `);
        }
    },
    {
        name: "Create subscriptions payments unique constraint",
        execute: () => {
            return pool.query(`
                ALTER TABLE subscriptions_payments
                ADD UNIQUE (payment_id, sub_id);
            `);
        }
    },
    {
        name: "Create guild storages index",
        execute: () => {
            return pool.query(`
                CREATE INDEX idx_guild_storages_guild_id
                ON guild_storages (guild_id);
            `);
        }
    },
    // QUELS INDEX CREER POUR OPTIMISER LA RECUPERATION DES ABONNEMENTS ?
    // AJOUTER INDEX SUR subscriptions_payments ET guilds_subscriptions => TABLE SEULEMENT UTILISÉE POUR DES JOINTURES
    {
        name: "Create members index",
        execute: () => {
            return pool.query(`
                CREATE INDEX idx_members_user_id_guild_id
                ON members (user_id, guild_id);
            `);
        }
    },
    {
        name: "Create members index only guild",
        execute: () => {
            return pool.query(`
                CREATE INDEX idx_members_guild_id
                ON members (guild_id);
            `);
        }
    },
    {
        name: "Create payments index",
        execute: () => {
            return pool.query(`
                CREATE INDEX idx_payments_id
                ON payments (id);
            `);
        }
    },
    {
        name: "Create subscriptions index",
        execute: () => {
            return pool.query(`
                CREATE INDEX idx_subscriptions_id
                ON subscriptions (id);
            `);
        }
    }
];

const taskID = process.argv.includes("--taskID") ? process.argv[process.argv.indexOf("--taskID")+1] : null;

inquirer.prompt([
    {
        message: `Script is going to be applied on database ${config.postgres.database}. Continue?`,
        name: "confirm",
        type: "confirm"
    }
]).then((res) => {
    if (res.confirm) meeg.migrate(tasks, taskID);
});
