const mongoose = require("mongoose"),
Schema = mongoose.Schema,
config = require("../config.js");

module.exports = mongoose.model("GuildMember", new Schema({

    /* REQUIRED */
    id: { type: String }, // Discord ID of the user
    guildID: { type: String },

    /* STATS */
    fake: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    leaves: { type: Number, default: 0 },
    invites: { type: Number, default: 0 },

    /* INVITES DATA */
    invited: { type: Array, default: [] },
    left: { type: Array, default: [] },

    /* INVITER */
    invitedBy: { type: String },
    usedInvite: { type: Object },

    /* BOT */
    bot: { type: Boolean, default: false }

}));