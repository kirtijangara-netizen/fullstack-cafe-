const Order = require("../models/order");
const Product = require("../models/product");
const Support = require("../models/Support");

// ================= ADMIN DASHBOARD =================
exports.getDashboard = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });

    const products = await Product.find().sort({ category: 1 });

    const supportRequests = await Support.find().sort({ createdAt: -1 });

    res.render("adminDashboard", {
      orders: orders || [],
      products: products || [],
      supportRequests: supportRequests || [],
      user: req.user || null
    });

  } catch (err) {
    console.error("Admin Dashboard Error:", err);
    res.status(500).send("Admin Dashboard Error: " + err.message);
  }
};


// ================= UPDATE ORDER STATUS =================
exports.updateOrderStatus = async (req, res) => {
  try {

    const { orderId, status } = req.body;

    const allowedStatuses = ["Pending", "Preparing", "Delivered", "Cancelled"];

    if (!orderId || !status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data"
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Update Order Error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ================= ADD PRODUCT (WITH MULTER IMAGE UPLOAD) =================
exports.addProduct = async (req, res) => {
  try {

    const { name, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).send("All required fields must be filled");
    }

    // 🔥 image uploaded by multer
    let imagePath = "";

    if (req.file) {
      imagePath = "/images/" + req.file.filename;
    }

    await Product.create({
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      image: imagePath,
      isAvailable: true
    });

    res.redirect("/admin");

  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).send(err.message);
  }
};


// ================= TOGGLE PRODUCT AVAILABILITY =================
exports.toggleProductAvailability = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    return res.json({
      success: true,
      isAvailable: product.isAvailable
    });

  } catch (err) {
    console.error("Toggle Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};