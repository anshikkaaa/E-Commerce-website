require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require('cloudinary').v2;

const app = express();
const port = process.env.PORT || 4000;
const backendUrl = process.env.BACKEND_URL || `http://localhost:${port}`;

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['https://e-commerce-website-frontend-0bwq.onrender.com'],
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

const jwtSecret = process.env.JWT_SECRET;

// Multer memory storage for Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Models
const Product = mongoose.model("Product", {
    id: Number,
    name: String,
    image: String,
    category: String,
    old_price: Number,
    new_price: Number,
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },
});

const Users = mongoose.model('Users', {
    name: String,
    email: { type: String, unique: true },
    password: String,
    cartData: Object,
    date: { type: Date, default: Date.now },
});

// Routes
app.get("/", (req, res) => {
    res.send("Backend is running");
});

// Upload route using Cloudinary
app.post("/upload", upload.single('product'), async (req, res) => {
    try {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'ecommerce_products' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(req.file.buffer);
            });
        };
        const result = await streamUpload(req);
        res.json({ success: true, image_url: result.secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error });
    }
});

// Add product
app.post('/addproduct', async (req, res) => {
    const products = await Product.find({});
    const id = products.length > 0 ? products[products.length-1].id + 1 : 1;
    const product = new Product({ id, ...req.body });
    await product.save();
    res.json({ success: true, name: req.body.name });
});

// Remove product
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true, name: req.body.name });
});

// Fetch all products
app.get('/allproducts', async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

// Signup
app.post('/signup', async (req, res) => {
    const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ success: false, errors: "User already exists" });

    const cart = {};
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

    if (req.body.password !== user.password) return res.json({ success: false, errors: "wrong password" });

    const token = jwt.sign({ user: { id: user._id } }, jwtSecret);
    res.json({ success: true, token });
});

// Fetch new collections
app.get('/newcollections', async (req, res) => {
    const products = await Product.find({});
    res.json(products.slice(-8));
});

// Popular in women
app.get('/popularinwomen', async (req, res) => {
    const products = await Product.find({ category: "women" });
    res.json(products.slice(0, 4));
});

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ errors: "Please authenticate" });

    try {
        const data = jwt.verify(token, jwtSecret);
        req.user = data.user;
        next();
    } catch {
        res.status(401).json({ errors: "Invalid token" });
    }
};

// Cart routes
app.post('/addtocart', fetchUser, async (req, res) => {
    const userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.json({ message: "added" });
});

app.post('/removefromcart', fetchUser, async (req, res) => {
    const userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0) userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.json({ message: "removed" });
});

app.post('/getcart', fetchUser, async (req, res) => {
    const userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
});

// Start server
app.listen(port, () => {
    console.log("Server running on port " + port);
});
