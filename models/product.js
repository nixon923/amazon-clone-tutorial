const mongoose = require('mongoose');
const ratingSchema = require('./rating');

const productSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim: true,
    },
    description: {
        required: true,
        type: String,
        trim: true,
    },
    quantity: {
        required: true,
        type: Number,
    },
    images: [
        {
            required: true,
            type: String
        },
    ],
    price: {
        required: true,
        type: Number,
    },
    category: {
        required: true,
        type: String,
    },
    // * -- Ratings --
    // Array of objects
    ratings: [ratingSchema],
});

const Product = mongoose.model("Product", productSchema);
module.exports = { Product, productSchema };