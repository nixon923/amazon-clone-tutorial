const mongoose = require('mongoose');
const { productSchema } = require('./product');

const orderSchema = mongoose.Schema({
    products: [
        {
            product: productSchema,
            quantity: {
                type: Number,
                required: true,
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    // Who ordered this
    userId: {
        type: String,
        required: true,
    },
    // Time
    orderedAt: {
        type: Number,
        required: true,
    },
    // Status of order
    // 0 -> Pending (just placed order)
    // 1 -> Completed ()
    // 2 -> Received
    // 3 -> Delivered
    status: {
        type: Number,
        default: 0,
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;