const mongoose = require('mongoose');

// Whenever we need a strcuture, we don't have to create a model
// A model would generate _id and __v (version) which we don't need
const ratingSchema = mongoose.Schema({
    // So they can't change the rating
    // The new rating will replace the old one
    userId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
});

module.exports = ratingSchema;