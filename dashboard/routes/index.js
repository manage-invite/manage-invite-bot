const express = require("express"),
    CheckAuth = require("../auth/CheckAuth"),
    router = express.Router();

router.get("/", CheckAuth, async (req, res) => {
    res.redirect("/selector");
});

router.get("/selector", CheckAuth, async (req, res) => {
    res.render("selector", {
        user: req.userInfos,
        translate: req.translate,
        currentURL: `${req.client.config.baseURL}${req.originalUrl}`,
        member: req.member,
        discord: req.client.config.discord,
        locale: req.user.locale,
        paypal: req.client.config.paypal.mode === "live" ? req.client.config.paypal.live : req.client.config.paypal.sandbox
    });
});

router.get("/language", CheckAuth, async (req, res) => {
    req.user.locale = (req.query.new || "en-US").substr(0, 2);
    res.redirect(req.query.url || "/selector");
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    return res.redirect("https://docs.manage-invite.xyz");
});

module.exports = router;