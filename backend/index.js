require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

const app = express();
const port = process.env.PORT || 4000;
const backendUrl = process.env.BACKEND_URL || `http://localhost:${port}`;

app.use(express.json());
app.use(cors({
    origin: ['https://e-commerce-website-frontend-0bwq.onrender.com'], // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

const jwtSecret = process.env.JWT_SECRET;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage for images (in memory for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single('product'), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                folder: "ecommerce-products"
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({
                        success: 0,
                        message: "Image upload failed"
                    });
                }
                res.json({
                    success: 1,
                    image_url: result.secure_url
                });
            }
        ).end(req.file.buffer);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: 0,
            message: "Image upload failed"
        });
    }
});

// Product schema
const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    old_price: { type: Number, required: true },
    new_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },
});

// User schema
const Users = mongoose.model('Users', {
    name: String,
    email: { type: String, unique: true },
    password: String,
    cartData: Object,
    date: { type: Date, default: Date.now },
});

// Routes
app.post('/addproduct', async (req, res) => {
    const products = await Product.find({});
    const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
        id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });

    await product.save();
    res.json({ success: true, name: req.body.name });
});

app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("removed");
    res.json({
        success: true,
        name: req.body.name
    })
})

app.get('/allproducts', async (req, res) => {
    const products = await Product.find({});
    res.send(products);
});

// Signup
app.post('/signup', async (req, res) => {
    const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ success: false, errors: "existing user found with same email id" });

    let cart = {};
    for (let i = 0; i <= 300; i++) cart[i] = 0;

    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });

    await user.save();
    const token = jwt.sign({ user: { id: user._id } }, jwtSecret);
    res.json({ success: true, token });
});

// Login
app.post('/login', async (req, res) => {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) return res.json({ success: false, errors: "wrong email id" });

    if (req.body.password !== user.password) {
        return res.json({ success: false, errors: "wrong password" });
    }

    const token = jwt.sign({ user: { id: user._id } }, jwtSecret);
    res.json({ success: true, token });
});

app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("new collection fetched");
    res.send(newcollection);
})

app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let popular_in_women = products.slice(0, 4);
    console.log("popular in women fetched");
    res.send(popular_in_women);
})

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send({ errors: "please authenticate using valid token" });
    try {
        const data = jwt.verify(token, jwtSecret);
        req.user = data.user;
        next();
    } catch (err) {
        res.status(401).send({ errors: "please authenticate using a valid token" });
    }
};

// Cart routes
app.post('/addtocart', fetchUser, async (req, res) => {
    const userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send({ message: "added" });
});

app.post('/removefromcart', fetchUser, async (req, res) => {
    const userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0) userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send({ message: "removed" });
});

app.post('/getcart', fetchUser, async (req, res) => {
    const userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
});

// Start server
app.listen(port, () => {
    console.log("Backend running at port " + port);
});
