const mongoose = require("mongoose"),
Schema = mongoose.Schema,
config = require("../config.js");

module.exports = mongoose.model("Guild", new Schema({

    /* REQUIRED */
    id: { type: String }, // Discord ID of the guild
    
    /* BASIC CONF */
    language: { type: String, default: "english" }, // Language of the guild
    prefix: { type: String, default: config.prefix }, // Default or custom prefix of the guild
    
    /* INV CONF */

    joinDM: { type: Object, default: { // Message sent to a member when they join
        enabled: false,
        message: null
    }},
    
    join: { type: Object, default: {
        enabled: false,
        message: null,
        channel: null
    }},

    leave: { type: Object, default: {
        enabled: false,
        message: null,
        channel: null
    }},

    ranks: { type: Array, default: [] },
    stacked: { type: Boolean, default: true },
    blacklistedUsers: { type: Array, default: [] },

    premium: { type: Boolean, default: false }

}));