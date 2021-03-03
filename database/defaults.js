module.exports = {

    guild: (id) => ({
        guild_id: id,
        guild_language: 'en-US',
        prefix: '+',
        keepRanks: false,
        stackedRanks: false,
        cmdChannel: null,
        fakeThresold: null
    })

};

// Schema Redis

`/guilds/3908380833`
`guild_3988930`

({

    id: '',

    prefix: '',
    language: '',
    keepRanks: false,
    stackedRanks: false,
    cmdChannel: null,
    fakeThresold: null,

    messages: {
        join: {
            channelID: '',
            regularMessage: '',
            vanityMessage: '',
            oauthMessage: '',
            unknownMessage: ''
        },
    
        leave: {
            channelID: '',
            regularMessage: '',
            vanityMessage: '',
            oauthMessage: '',
            unknownMessage: ''
        },
    
        joinDM: {
            regularMessage: '',
            vanityMessage: '',
            oauthMessage: '',
            unknownMessage: ''
        }
    },

    blacklistedUserIDs: [],
    subscriptions: [],
    ranks: []

})

// Member

`/guilds/3893890389/members/3083033`

({

    id: '',
    guildID: '',

    regular: 0,
    fake: 0,
    bonus: 0,
    leave: 0,

    joinEvents: [],
    invitedMemberJoinEvents: []
})
