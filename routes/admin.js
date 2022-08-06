const express = require("express");
const adminRouter = express.Router();
const admin = require("../middlewares/admin_middleware");
const { Product } = require("../models/product");
const Order = require("../models/order");


// Creating an Admin Middleware
// Get user by Id and check if the type is Admin

// * -- Adding Product --
adminRouter.post("/admin/add-product", admin, async (req, res) => {
    try {
        const {
            name,
            description,
            images,
            quantity,
            price,
            category,
        } = req.body;
        // Using let so it could be changed later on
        // -- creating a product and assigning it to product --
        let product = new Product({
            name,
            description,
            images,
            quantity,
            price,
            category,
        });
        // -- saving the product which is a model using mongooDB--
        product = await product.save();
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Getting all products --

adminRouter.get("/admin/get-products", admin, async (req, res) => {
    try {
        // Returns a list of products
        // Product.find({id: specificId});
        const products = await Product.find({});
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Deleting a product --
adminRouter.post("/admin/delete-product/", admin, async (req, res) => {
    try {
        // Grabbing id from req.body
        const { id } = req.body;
        // Product is deleted and saved
        let product = await Product.findByIdAndDelete(id);
        // Not required to do this, but it sends status code of 200
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Getting all Orders --
adminRouter.get("/admin/get-orders", admin, async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Changing Order Status --
adminRouter.post("/admin/change-order-status", admin, async (req, res) => {
    try {
        const { id, status } = req.body;
        let order = await Order.findById(id);
        order.status = status;
        order = await order.save();
        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Getting Earnings --
adminRouter.get('/admin/analytics', admin, async (req, res) => {
    try {
        const orders = await Order.find({});

        let totalEarnings = 0;

        for (let i = 0; i < orders.length; i++) {
            for (let j = 0; j < orders[i].products.length; j++) {
                totalEarnings += orders[i].products[j].quantity * orders[i].products[j].product.price;

            }
        }

        // Category Wise order fetching
        let mobilesEarnings = await fetchCategoryWiseProduct("Mobiles");
        let essentialsEarnings = await fetchCategoryWiseProduct("Essentials");
        let appliancesEarnings = await fetchCategoryWiseProduct("Appliances");
        let booksEarnings = await fetchCategoryWiseProduct("Books");
        let fashionEarnings = await fetchCategoryWiseProduct("Fashion");

        let earnings = {
            totalEarnings,
            mobilesEarnings,
            essentialsEarnings,
            appliancesEarnings,
            booksEarnings,
            fashionEarnings,
        }

        res.json(earnings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Or const fetchCategoryWiseProduct = async (category) => {}
async function fetchCategoryWiseProduct(category) {
    let earnings = 0;
    let categoryOrders = await Order.find({
        "products.product.category": category,
    });

    for (let i = 0; i < categoryOrders.length; i++) {
        for (let j = 0; j < categoryOrders[i].products.length; j++) {
            earnings += categoryOrders[i].products[j].quantity * categoryOrders[i].products[j].product.price;
        }
    }
    return earnings;
}

module.exports = adminRouter;