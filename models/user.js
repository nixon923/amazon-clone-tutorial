const mongoose = require('mongoose');
const { productSchema } = require('./product');

// Schema --> a structure of our application
// A structure of our user model
const userSchema = mongoose.Schema({
    name: {
        // Specifying property for Mongoose
        required: true,
        type: String,
        trim: true,
        // ' Nixon '
        // 'Nixon'
    },
    email: {
        required: true,
        type: String,
        trim: true,
        validate: {
            // Same as validator: (val) {} in custom_textfield.dart
            // In the syntax of Javascript
            validator: (value) => {
                // Regular Expression or Regex
                // A sequence of characters that specify a search pattern in a text
                const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return value.match(re);
            }
        },
        // Runs when validate is false
        message: "Please enter a valid email address"
    },
    password: {
        required: true,
        type: String,
        validate: {
            validator: (value) => {
                return value.length > 6;
            }
        },
        message: "Please enter a longer password"
    },
    // Whenever we create a user model, there will be an address and it would be set to ''
    address: {
        type: String,
        default: "Test",
    },
    // User type: seller, admin
    type: {
        type: String,
        default: "user",
    },
    // Cart
    // Like rating, it would store a list of widgets
    // Product Schema + quantity
    cart: [
        {
            product: productSchema,
            quantity: {
                type: Number,
                required: true,
            }
        },
    ],
});

// Exporting the userSchema
const User = mongoose.model("User", userSchema);
module.exports = User;