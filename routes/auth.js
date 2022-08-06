const express = require("express");
// importing user.js from model folder
const User = require("../models/user");
const bcryptjs = require('bcryptjs');

// We are not going to initialize authRouter with express()
// These are all private
// Variables can only be accessed within this file
const authRouter = express.Router();

// Json Web Token
const jwt = require('jsonwebtoken');
const auth = require("../middlewares/auth_middleware");

/*
authRouter.get('/user', (req, res) => {
  res.json({msg: "nixon"});
});
*/

// -- SEVER SIGNUP API --

// .get is a different api compared to .post
// Could use them in the Thunder Client testing
// GET /api/signup is different from
// POST /api/signup
authRouter.post('/api/signup', async (req, res) => {
    try {
        // 1. Get the data from the client
        // Whenever you send in a post request
        // you pass in a body, and it's going to be a map
        // console.log(req.body);
        // We want to accept name, email and password
        const {name, email, password} = req.body;

        // 2. Post that data in the database
            // Performing validations?
            // Firebase authentication handles everything for us
            // Weak-password - 6 char, same account with email
            // We are doing it all manually --> models/user.js
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({msg: "User with same email already exists :)"});
            // Returns a status code of 200 --> means ok, successful
            // We want to pass in 400 as it's a client error --> 400 Bad Request
            // Add .status
            // Return stops the server/app execution here
        }
            // User.findOne is a property by Mongoose
            // Finding a user User.findOne({email: email}) shorthand email
            // Finding if there's an existing one
            // fineOne is a promise, it's going to take a lot of time
            // Thus it's an asychronous process --> make function async to use wait
        
        // 8 is the salt 
        // .hash is a promise, hover over it to see 
        const hashedPassword = await bcryptjs.hash(password, 8);

        // Creating a User object, everything is an object in javascript
        // Just like everything is a widget in Flutter
        // Allow saving let or var, scope functionality problems use let
        // Doesn't matter what order you pass it in
        let user = new User({
            email,
            // password,
            // Since it is of type password
            // You cannot type in hashedPassword,
            // It means hashedPassword: hashedPassword
            password: hashedPassword,
            name,
        })   
        // Await as we are using MongooDB to save
        // It will give us two more fields
            // _v --> versions, number of times we edited it
            // id --> unique ID
        user = await user.save();
        res.json(user);


        // 3. Return that data to the user
    } catch (e) {
        // 500 is internal server error
        res.status(500).json({error: e.message});
    }
    
});

// -- Signing In --
// Similar post request
// 1. Find user with existing email and get password
// 2. bcrypt the password entered and compare to hashedpassword 

authRouter.post('/api/signin', async (req, res) => {
    try {
        const {name, email, password} = req.body;

        // Finding the user, get user data, check if it exists
        const user = await User.findOne({email});

        // If user is null or undefined, true
        if (!user) {
            return res
                .status(400)
                .json({msg: "User does not exist."});
        } // Validation done, user is signed up

        // Built in function
        // You can't just use .hash because of random salt. No two password will be the same
        const isMatch = await bcryptjs.compare(password, user.password);
        // Guard Clauses
        if (!isMatch) {
            return res
                .status(400)
                .json({msg: "Incorrect password."});
        }

        // Using jsonwebtoken
        // sign() Synchronously sign the given payload into a JSON Web Token string payload
        // Authorize user with secrete or private key
        // With "passwordKey" we can verify if that jwt is correct or not
        // This token will be used everywhere with send requests in the header
        const token = jwt.sign({id: user._id}, "passwordKey");
        // The token will reside in the app's memory, so we need to send it
        // Also send user data and save to user provider, so it can be accessed
        // How to send token + user data:
        res.json({token, ...user._doc});
            // ... is object destructuring
            // It will give us the following format
            // {
            // 'token': 'tokensomething',
            // 'name': 'nixon',
            // 'email': 'test@test.com'
            //}
            // We can just use user but it's a big object with no use to us
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});


// -- Validating User Data --
authRouter.post("/tokenIsValid", async (req, res) => {
    try {
        // Getting the token from the request header 
        const token = req.header('x-auth-token');
        
        // If token doesn't exist or is null
        // False is an answer to tokenIsValid?
        if(!token) return res.json(false);
        // Verifying token with the secret or public key that we signed in Signin
        const isVerified = jwt.verify(token, "passwordKey");
        if(!isVerified) return res.json(false);
        
        // If it is verified, check if the user is available or not
        // It may be a random token that happens to be correct
        // There are a lot of functions besides findOne
        // This is because we don't want to delete anything, we just want to get that data
        // We are getting the id from the isVerified object 
        // const token = jwt.sign({id: user._id}, "passwordKey"); We did this in signin
        const user = await User.findById(isVerified.id);
        // If user does not exist
        if (!user) return res.json(false);

        // If all passes
        res.json(true);
    } catch (e) {
        res.status(500).json({ error: e.message});
    }
});

// -- Getting User Data --
// Instead of post we use get
// auth is the middleware that we need to create
// The middleware will make sure you are authorized
// Meaning: You will only get the capability to access this route if you're signed in

// auth auto import from auth_middleware.js
authRouter.get("/", auth, async (req, res) => {
    // We are getting req.user and req.token from the auth middleware
    const user = await User.findById(req.user);  
    // to print and see you can use console.log
    // Passing in the token
    res.json({...user._doc, token: req.token});
})


// Making the variables public
module.exports = authRouter;