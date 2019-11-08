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
        currentURL: `${req.client.config.baseURL}${req.originalUrl}`,
        member: req.member,
        discord: req.client.config.discord
    });
});

router.get("/language", CheckAuth, async(req, res) => {
    req.user.locale = (req.query.new || "en").substr(0, 2);
    res.redirect(req.query.url || "/selector");
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    return res.redirect("https://docs.manage-invite.xyz");
});

module.exports = router;