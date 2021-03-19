const config = require("../config");
const { Pool } = require("pg");

const meeg = require("./meeg");

const pool = new Pool(config.postgresV4748);

const tasks = [
    {
        name: "Create random_string function",
        execute: () => {
            return pool.query(`
                Create or replace function random_string(length integer) returns text as
                $$
                declare
                chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}';
                result text := '';
                i integer := 0;
                begin
                if length < 0 then
                    raise exception 'Given length cannot be less than 0';
                end if;
                for i in 1..length loop
                    result := result || chars[1+random()*(array_length(chars, 1)-1)];
                end loop;
                return result;
                end;
                $$ language plpgsql;
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
                SET guild_storage_id = random_string(12);
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
        execute: (log) => {
            return pool.query(`
                SELECT guild_id, guild_storage_id FROM guilds
            `).then(({ rows: guildsRows }) => {
                log("Got guilds storage ids");
                const guildsStorageIDs = Object.fromEntries(guildsRows.map((r) => [ r.guild_id, r.guild_storage_id ]));
                return pool.query(`
                    SELECT user_id, guild_id FROM members
                `).then(({ rows: membersRows }) => {
                    log("Got members");
                    return pool.query(membersRows.map((row) => `UPDATE members SET storage_id = '${guildsStorageIDs[row.guild_id]}' WHERE user_id = '${row.user_id}' AND guild_id = '${row.guild_id}'`).join("; "));
                });
            });
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
                UPDATE invited_member_events AS me
                SET storage_id = gs.guild_storage_id
                FROM guilds AS gs
                WHERE gs.guild_id = me.guild_id;
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

meeg.migrate(tasks, taskID);

/*
"DELETE FROM guilds WHERE guild_language = 'en-US' AND guild_prefix = '+' AND guild_keep_ranks = false AND guild_stacked_ranks = false";

"DELETE rom members...";

changer le guild settings avec ajout de current ? (guild settings ne sera pas créé par défaut)
*/
