module.exports = async (req, res, next) => {
    if (req.user){
        return next();
    } else {
        const redirectURL = ((req.originalUrl.includes("login") || req.originalUrl === "/") ? "/selector" : req.originalUrl);
        const state = req.client.functions.randomID();
        req.client.states[state] = redirectURL;
        return res.redirect(`/api/login?state=${state}`);
    }
};