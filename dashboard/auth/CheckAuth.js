module.exports = async (req, res, next) => {
    if(req.user){
        console.log("User found");
	    return next();
    } else {
        console.log("User not found");
        let redirectURL = ((req.originalUrl.includes("login") || req.originalUrl === "/") ? "/selector" : req.originalUrl);
        let state = req.client.functions.randomID();
        req.client.states[state] = redirectURL;
	    return res.redirect(`/api/login?state=${state}`);
    }
};