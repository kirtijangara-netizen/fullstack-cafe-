const path = require("path");
const dotenv = require("dotenv");

// ✅ Load .env from root folder safely
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const Product = require("../models/product");
 // make sure filename matches exactly
const connectDB=require("../config/db");
connectDB();
//const MONGO_URI = process.env.MONGO_URI;

const products = [
  { name: "Burger", price: 120, image: "/images/Burger.jpg", category: "Fast Food" },
  { name: "Cake", price: 120, image: "/images/Cake.avif", category: "Desserts" },
  { name: "Coffee", price: 120, image: "/images/Coffee.avif", category: "Drinks" },
  { name: "Egg", price: 40, image: "/images/Egg.avif", category: "Desserts" },
  { name: "Icecream", price: 120, image: "/images/Icecream.avif", category: "Desserts" },
  { name: "Momose", price: 60, image: "/images/Momose.avif", category: "Fast Food" },
  { name: "Nodle", price: 120, image: "/images/nodle.avif", category: "Fast Food" },
  { name: "Pizza", price: 120, image: "/images/Pizza.avif", category: "Fast Food" },
  { name: "Pastry", price: 120, image: "/images/Pastry.avif", category: "Desserts" },
  { name: "Coco Cake", price: 120, image: "/images/cococake.jpg", category: "Desserts" },
  { name: "Coco Cream Cake", price: 80, image: "/images/cococreamcake.jpg", category: "Desserts" },
  { name: "Black Coffee", price: 50, image: "/images/blackcoffee.jpg", category: "Drinks" },
  { name: "Tea", price: 20, image: "/images/tea.jpg", category: "Drinks" }
];

const seedDB = async () => {
  try {
   
    // Clear old data
    await Product.deleteMany({});
    console.log("Old products cleared 🗑️");

    // Insert new data
    await Product.insertMany(products);
    console.log("Database Seeded Successfully 🥣");
    mongoose.connection.close();

  } catch (error) {
    console.error("Error seeding database ❌:", error.message);
  } 
};

seedDB();