const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("../models/product");
const connectDB = require("../config/db");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

connectDB();

const products = [
  { name: "Burger", price: 120, image: "/images/Burger.jpg", category: "Fast Food", description: "Juicy grilled patty with fresh veggies and our secret house sauce." },
  { name: "Cake", price: 450, image: "/images/Cake.avif", category: "Desserts", description: "Rich, velvety chocolate layers topped with premium ganache." },
  { name: "Coffee", price: 120, image: "/images/Coffee.avif", category: "Drinks", description: "Freshly brewed Arabica beans for the perfect morning kick." },
  { name: "Egg", price: 40, image: "/images/Egg.avif", category: "Desserts", description: "Classic boiled eggs, seasoned with a pinch of salt and pepper." },
  { name: "Icecream", price: 120, image: "/images/Icecream.avif", category: "Desserts", description: "Creamy vanilla bean ice cream made with real dairy." },
  { name: "Momose", price: 60, image: "/images/Momose.avif", category: "Fast Food", description: "Steamed Himalayan dumplings served with spicy tomato chutney." },
  { name: "Pizza", price: 250, image: "/images/Pizza.avif", category: "Fast Food", description: "Hand-tossed dough with melty mozzarella and fresh basil." },
  { name: "Pastry", price: 80, image: "/images/Pastry.avif", category: "Desserts", description: "Light and flaky pastry filled with sweet vanilla custard." },
  { name: "Coco Cake", price: 120, image: "/images/cococake.jpg", category: "Desserts", description: "Delicious coconut-infused sponge cake with shredded coconut flakes." },
  { name: "Coco Cream Cake", price: 150, image: "/images/cococreamcake.jpg", category: "Desserts", description: "A tropical delight featuring heavy coconut cream frosting." },
  { name: "Black Coffee", price: 50, image: "/images/blackcoffee.jpg", category: "Drinks", description: "Pure, bold espresso topped with hot water for a smooth finish." },
  { name: "Tea", price: 20, image: "/images/tea.jpg", category: "Drinks", description: "Traditional Indian Masala Chai brewed with ginger and cardamom." }
];

const seedDB = async () => {
  try {
    await Product.deleteMany({});
    console.log("Old products cleared 🗑️");
    await Product.insertMany(products);
    console.log("Database Seeded Successfully with Descriptions 🥣");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database ❌:", error.message);
  } 
};

seedDB();