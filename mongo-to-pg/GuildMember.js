const mongoose = require("mongoose"),
Schema = mongoose.Schema;

let GuildMemberSchema = new Schema({

    /* REQUIRED */
    id: { type: String }, // Discord ID of the user
    guildID: { type: String },

    /* STATS */
    fake: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    leaves: { type: Number, default: 0 },
    invites: { type: Number, default: 0 },

    /* OLD STATS (restore command) */
    old_fake : { type: Number, default: 0 },
    old_bonus: { type: Number, default: 0 },
    old_leaves: { type: Number, default: 0 },
    old_invites: { type: Number, default: 0 },
    backuped: { type: Boolean, default: false },

    /* INVITES DATA */
    invited: { type: Array, default: [] },
    left: { type: Array, default: [] },

    /* INVITER */
    invitedBy: { type: String },
    usedInvite: { type: Object },
    joinData: { type: Object }, // { type: "normal" || "oauth" || "unknown" || "vanity", invite: inviteData || null }

    /* BOT */
    bot: { type: Boolean, default: false }

});

GuildMemberSchema.method("calcInvites", function () {
    return (this.regular + this.bonus - this.leaves - this.fake);
});

module.exports = mongoose.model("GuildMember", GuildMemberSchema);

