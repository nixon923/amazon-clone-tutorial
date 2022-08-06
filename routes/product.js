const { json } = require("express");
const express = require("express");
const productRouter = express.Router();
const auth = require("../middlewares/auth_middleware");
// {Product} is to destructure it
const { Product } = require("../models/product");


// * -- Getting Products User Side --
// What we want /api/products?category=Essentials
// Name of property (category)
productRouter.get("/api/products/", auth, async (req, res) => {
    try {
        // You can't get body in get request
        // console.log(req.query.category)
        // .query would get anything with the ? before it e.g. ?category = Essential
        // It will return the current category

        // api/products:category=Essentials
        // requires req.params.category
        const products = await Product.find({ category: req.query.category });
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Returning Search Results --
productRouter.get("/api/products/search/:name", auth, async (req, res) => {
    try {
        // If we have /api/products/search/:name/:name2
        // We can access it with req.params.name2
        // Using regex search patterns
        const products = await Product.find({
            // Mongoose and MongoDB have built-in support for that
            name: { $regex: req.params.name, $options: "i" },
            // Alternatively, you can put
            // name: req.params.name
            // But then the search has to be exact
        });
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Rate the Product --
productRouter.post("/api/rate-product/", auth, async (req, res) => {
    try {
        // Extract id and rating from req.body
        // id is product id, rating is the rating they just gave
        const { id, rating, } = req.body;
        let product = await Product.findById(id);

        // Run a for loop for all the ratings a product have

        // * -- If there is any extra rating, remove it --
        // ratings is the array in product, rating is the number we just rated
        for (let i = 0; i < product.ratings.length; i++) {
            // req.user from auth middleware
            if (product.ratings[i].userId == req.user) {
                // Available for Javascript arrays
                // Let's you change the content of your array by removing or replacing existing elements with new ones
                // .splice(start: number, deleteCount: number)
                // .splice(i, 1) deleting one object starting from i
                product.ratings.splice(i, 1);
                break;
            }
        }
        // What is passed in rating array
        // ratings[i] contains the whole object
        // {
        //  userId: "xxx1",
        //  rating: 2
        // },
        // {
        //  userId: "xxx2",
        //  rating: 2.5
        // },

        const ratingSchema = {
            userId: req.user,
            rating: rating
        };

        // Similar to .add
        // appends new elements to the end of an array,
        // and returns the new length of the array
        product.ratings.push(ratingSchema);
        product = await product.save();
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// * -- Getter for Deal of the Day --
// Based on the highest rating
productRouter.get("/api/get-deal-of-day", auth, async (req, res) => {
    try {
        let products = await Product.find({});
        // Sort product based on rating in descending order
        // A -> 10
        // B -> 30 
        // C -> 50
        // You can name product1, product2 to anything, e.g. a and b
        products = products.sort((product1, product2) => {
            let product1Sum = 0;
            let product2Sum = 0;

            for (let i = 0; i < product1.ratings.length; i++) {
                product1Sum += product1.ratings[i].rating;
            }
            for (let i = 0; i < product2.ratings.length; i++) {
                product2Sum += product2.ratings[i].rating;
            }

            // We could do product1Sum - product2Sum as well
            // If product2 takes precedence over product1, it moves up
            return product1Sum < product2Sum ? 1 : -1;
        });

        res.json(products[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = productRouter;