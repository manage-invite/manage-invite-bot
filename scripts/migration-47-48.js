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
        }
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
                ALTER TABLE members ALTER COLUMN invite_bonus TYPE INT;
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
