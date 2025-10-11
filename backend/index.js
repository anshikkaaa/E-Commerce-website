require('dotenv').config();
const port = process.env.PORT || 4000;
// CLOUD_NAME = dygoauvkw
// API_KEY = 363222139992227
// API_SECRET = fCaTcNFWalgGxBDOpz4IEfPKO6E
// const MONGODB_URL = "mongodb+srv://anshikajindal4444:lFCX2NCI0HwsQuiU@cluster0.krrhaul.mongodb.net/e-commerce"
const backendUrl = process.env.BACKEND_URL || `http://localhost:${port}`;

const express = require("express")
const app = express()
const mongoose = require("mongoose")
const path = require("path")

const jwt = require("jsonwebtoken")
const multer = require("multer")
const cors = require("cors")
const { type } = require("os")

app.use(express.json());
app.use(cors({
    origin: ['https://e-commerce-website-frontend-0bwq.onrender.com'], // frontend URL
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true
}));

// mongoose.connect("mongodb+srv://anshikajindal4444:lFCX2NCI0HwsQuiU@cluster0.krrhaul.mongodb.net/e-commerce")
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const jwtSecret = process.env.JWT_SECRET;
const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

app.get("/", (req, res) => {
    res.send("express app is running")
})

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })

app.use('/images', express.static('upload/images'))

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        // image_url: `http://localhost:${port}/images/${req.file.filename}`
      image_url: `${backendUrl}/images/${req.file.filename}`
    })
})

const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
})

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1)
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("saved")
    res.json({
        success: true,
        name: req.body.name,
    })
})

app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("removed");
    res.json({
        success: true,
        name: req.body.name
    })
})

app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log('all products fetched');
    res.send(products);
})

//schema for user model
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
})

app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "existing user found with same email id" })
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user: {
            id: user._id
        }
    }

    const token = jwt.sign(data, jwtSecret)
    res.json({ success: true, token })
})

//creating endpoint for user login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email })
    if (user) {
        const passCompare = req.body.password === user.password
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, jwtSecret)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, errors: "wrong password" })
        }
    }
    else {
        res.json({ success: false, errors: "wrong email id" })
    }
})

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

//creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ errors: "please authenticate using valid token" })
    }
    else {
        try {
            const data = jwt.verify(token, jwtSecret);
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "please authenticate using a valid token" })
        }
    }

}

app.post('/addtocart', fetchUser, async (req, res) => {
    console.log("added", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData })
    res.send({message:"added"})
})

app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0)
        userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData })
    res.send({message:"removed"})
})

app.post('/getcart', fetchUser, async (req, res) => {
    console.log("getcart");
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
})

app.listen(port, () => {
    console.log("app is running at port " + port)
});
