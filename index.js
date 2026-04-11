require("dotenv").config(); // Optimized loading

const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// ================= DATABASE =================
connectDB();

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= MIDDLEWARES =================
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// IMPORTANT: Move authMiddleware inside specific routes or 
// ensure it handles public routes (login/signup) correctly.
const authMiddleware = require("./middleware/authMiddleware");

// ================= ROUTES =================
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const supportRoutes = require("./routes/supportRoutes");
const adminRoutes = require("./routes/adminRoutes");

// 1. Auth routes (Login/Signup/OTP) - should be public
app.use("/", authRoutes);

// 2. Protected routes - you can apply authMiddleware here specifically
app.use("/products", authMiddleware, productRoutes);
app.use("/cart", authMiddleware, cartRoutes);
app.use("/order", authMiddleware, orderRoutes);
app.use("/support", authMiddleware, supportRoutes);
app.use("/admin", authMiddleware, adminRoutes);

// ================= DEFAULT ROUTE =================
app.get("/", (req, res) => {
  res.redirect("/products");
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).render("404", { user: req.user || null });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // DEBUG: Check if .env is loading (Remove this after testing)
  console.log("Check Client ID:", process.env.GOOGLE_CLIENT_ID ? "LOADED" : "NOT LOADED");
});