// CREATING AN API using Express

// -- IMPORTS FROM PACKAGES --

// similar to import 'package:express/express.dart'
// can be const abc = require('express');
const express = require('express');
// make connections to the database
const mongoose = require('mongoose');

// -- IMPORTS FROM OTHER FILES --
const authRouter = require('./routes/auth.js');
const adminRouter = require('./routes/admin.js');
const productRouter = require('./routes/product.js');
const userRouter = require('./routes/user.js');

// -- INIT --
// 3000 for a port is a convention
const PORT = 3000;
// Initialize express into a variable
const app = express();
const DB = "mongodb+srv://nixon923:carlonixon@cluster0.6pyg8.mongodb.net/?retryWrites=true&w=majority"

// MIDDLEWARE
// CLIENT (flutter) sending to SERVER --> CLIENT
// CLIENT --> middleware --> SERVER --> CLIENT
// Middleware specifies the format to be sent
// For continuous listening use Socket.io (real time communication)

// app.use(express.json()); passes incoming requests with json payloads
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);
// Mongoose connections
// It's a promise, when we connect to the database we pass in a funcction
// Thus .then
// Or await mongoose.connect() but we are not in any asychronous function
mongoose.connect(DB).then(() => {
    console.log("Connection Successful");
}).catch(e => {
    console.log(e);
});

// Binds itself with the host that we are going to specify
// And listen for any other connections
// First pass in the port
// If we don't put an IP address after app.listen(PORT, )
// It uses localhost, you can still use localhost if you add IP
app.listen(PORT, "0.0.0.0", function () {
    console.log(`connected at port ${PORT}`);
});


// 0.0.0.0 It can be accessed from anywhere
// On Android Emulators localhost doesn't work just for debugging
// Callback function after IP, or () => {}
// Bad practice to ("Connected at port" + PORT)

// -- CREATING AN API --
// Basically GET, PUT, POST, DELETE, UPDATE --> CRUD
// Create, Read, Update, Delete

// GET
// http://<yourip>/
// req --> request, res --> result
//app.get('/', (req, res) => {
    // You can use .send or .json
    // .send will send in basic text format
    // .json will be formated to json
//    res.send("hello");
//});

//app.get('/', (req, res) => {
//    res.json({name: 'Nixon'});
//})