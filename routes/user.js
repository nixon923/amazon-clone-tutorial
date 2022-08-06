const express = require("express");
const auth = require("../middlewares/auth_middleware");
const { Product } = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const userRouter = express.Router();

// * -- Add To Cart --
userRouter.post('/api/add-to-cart', auth, async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);
        let user = await User.findById(req.user);

        if (user.cart.length == 0) {
            user.cart.push({ product, quantity: 1 });
        } else {
            let isProductFound = false;
            // Is the product already in the cart? if so add 1 more
            // _id is an object Id
            // Since you are comparing mongooDB objects, == wouldn't work
            for (let i = 0; i < user.cart.length; i++) {
                if (user.cart[i].product._id.equals(product._id)) {
                    isProductFound = true;
                    // If it is true, add quantity, if not, add product
                }
            }

            if (isProductFound) {
                // Javascript array function .find()
                // Finds in ascending order
                let existingProduct = user.cart.find((x) => x.product._id.equals(product.id));
                existingProduct.quantity += 1;
            } else {
                user.cart.push({ product, quantity: 1 });
            }
        }

        user = await user.save();
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Remove From Cart --
userRouter.delete('/api/remove-from-cart/:id', auth, async (req, res) => {
    try {
        // same as req.params.id
        const { id } = req.params;
        const foundProduct = await Product.findById(id);
        let user = await User.findById(req.user);

        // product is already there
        for (let i = 0; i < user.cart.length; i++) {
            if (user.cart[i].product._id.equals(foundProduct._id)) {
                // If quantity is going from 1 to 0
                if (user.cart[i].quantity == 1) {
                    user.cart.splice(i, 1);
                } else {
                    // Don't user user.cart[i].product.quantity as it's the stock
                    user.cart[i].quantity -= 1;
                }
            }
        }

        user = await user.save();
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Save User Address (Post Request) --
userRouter.post('/api/save-user-address', auth, async (req, res) => {
    try {
        const { address } = req.body;
        // Instead of getting id, could just do this:
        let user = await User.findById(req.user);
        user.address = address;

        user = await user.save();
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


//  * -- Order Product -- 
userRouter.post('/api/order', auth, async (req, res) => {
    try {
        const { cart, totalPrice, address } = req.body;
        let products = [];

        for (let i = 0; i < cart.length; i++) {
            let product = await Product.findById(cart[i].product._id);
            // Checking if available stock can fulfill order
            if (product.quantity >= cart[i].quantity) {
                product.quantity -= cart[i].quantity;
                // Order being placed
                products.push({ product, quantity: cart[i].quantity });
                // Product is going to keep changing, so need to save it within the loop
                // e.g. 1st loop is Apple iPhone, 2nd is Bottle
                await product.save();
            } else {
                // * -- If Product is out of stock --
                // `` allows for string interpretation
                // 400 Bad Request
                return res.status(400).json({ msg: `${product.name} is out of stock` });
            }
        }

        // * -- First, clear cart --
        let user = await User.findById(req.user);
        user.cart = [];
        user = await user.save();

        // * -- Second, order --
        let order = new Order({
            products,
            totalPrice,
            address,
            userId: req.user,
            orderedAt: new Date().getTime(),
        });
        order = await order.save();
        res.json(order);

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Fetching Orders --
userRouter.get("/api/get-orders/me", auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user });
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = userRouter;