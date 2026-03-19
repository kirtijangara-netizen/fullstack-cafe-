const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// ================= DATABASE =================
const connectDB = require("./config/db");
connectDB();

// ================= MIDDLEWARES =================
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const authMiddleware = require("./middleware/authMiddleware");
app.use(authMiddleware);

// ================= ROUTES =================
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const supportRoutes = require("./routes/supportRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/admin", adminRoutes);

// Mount routes properly`
app.use("/", authRoutes);
app.use("/order", orderRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/support", supportRoutes);

  // ✅ FIXED

// ================= DEFAULT ROUTE =================
app.get("/", (req, res) => {
  res.redirect("/products");
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).render("404");
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});