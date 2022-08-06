// AUTH MIDDLEWARE
// Every time we use authentication to fetch products, add to cart
// We will use this middleware

// Importing jwt package
const jwt = require('jsonwebtoken');

// Pass in token and verify token

// Next is similar to continue on to the next route
// as we are passing it in as a middleware
const auth = async (req, res, next) => {
    try {

        const token = req.header('x-auth-token');
        // If token is null or non-existing
        // 401 means unauthorized
        if (!token) return res.status(401).json({msg: "No Auth Token, Access Denied X"});

        const isVerified = jwt.verify(token, "passwordKey");
        if(!isVerified) return res.status(401).json({msg: "Token Verification Failed, Authorization Denied!"});

        //Important step
        // We are adding a new object to this request, which is User
        // If it passes validation every time
        // We are storing User Id in the request.user
        req.user = isVerified.id;

        // So whenever we create some authenticated route when we added the middleware as auth
        // We can use req.user like req.header("x-auth-token")
        // req.user will fetch the user's id

        // Same fashion, we can access req.token
        req.token = token;

        // If we don't put next
        // In auth.js
        // authRouter.get('/', auth, async (req, res) => {})
        // auth is the middleware and without next it won't go to async (req, res) => {}
        
        // it can call the next callback function
        next();

    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

// Need to export auth so that it could be used
module.exports = auth;