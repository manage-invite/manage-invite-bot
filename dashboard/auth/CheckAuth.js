module.exports = async (req, res, next) => {
    if(req.user){
	    return next();
    } else {
        let redirectURL = ((req.originalUrl.includes("login") || req.originalUrl === "/") ? "/selector" : req.originalUrl);
        let state = req.client.functions.randomID();
        req.client.states[state] = redirectURL;
	    return res.redirect(`/api/login?state=${state}`);
    }
};