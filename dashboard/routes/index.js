const express = require("express"),
CheckAuth = require("../auth/CheckAuth"),
router = express.Router();

router.get("/", CheckAuth, async (req, res) => {
    res.redirect("/selector");
});

router.get("/selector", CheckAuth, async(req, res) => {
    res.render("selector", {
        user: req.userInfos,
        language: req.language,
        currentURL: `${req.client.config.baseURL}/${req.originalUrl}`,
        member: req.member,
        discord: req.client.config.discord
    });
});

module.exports = router;