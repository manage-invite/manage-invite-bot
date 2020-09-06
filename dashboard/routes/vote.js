const express = require("express"),
    router = express.Router();

router.post("/", async (req, res) => {
    if (req.headers.authorization === req.client.config.topAuth){
        const user = await req.client.users.fetch(req.body.user);
        const vote = escape(`:arrow_up: **${user.tag}** (\`${user.id}\`) voted for **ManageInvite**, thank you! **<https://discordbots.org/bot/${req.client.user.id}/vote>**`);
        const { voteLogs } = req.client.config;
        req.client.shard.broadcastEval(`
            let aLogs = this.channels.cache.get('${voteLogs}');
            if(aLogs) aLogs.send(unescape('${vote}'));
        `);
        res.status(200).send({
            message: "Thank you =)"
        });
    }
});

module.exports = router;
