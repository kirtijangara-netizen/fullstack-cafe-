const Order = require("../models/order");
const Product = require("../models/product");
const Support = require("../models/Support");
const User = require("../models/user"); // Added for total users count

// ================= ADMIN DASHBOARD (Includes Stats + Previous Logic) =================
exports.getDashboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8; 
    const skip = (page - 1) * limit;

    // 1. Fetch paginated products (Preserved)
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    // AJAX CHECK: If clicking pagination, return JSON only (Preserved)
    if (req.query.ajax === 'true' || req.xhr) {
      return res.json({
        success: true,
        products,
        currentPage: page,
        totalPages
      });
    }

    // 2. DASHBOARD STATS LOGIC (NEW)
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } }); // Excludes admins from customer count
    
    // Revenue Calculation (Excluding Cancelled Orders)
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // 3. Full Page Load Data (Orders & Support - Preserved)
    const orders = await Order.find()
      .populate("user", "name email") 
      .populate({
        path: "items.productId",
        select: "name price" 
      })
      .sort({ createdAt: -1 });

    const supportRequests = await Support.find().sort({ createdAt: -1 });

    // Render with all data including new stats
    res.render("adminDashboard", {
      orders: orders || [],
      products: products || [],
      supportRequests: supportRequests || [],
      user: req.user || null,
      currentPage: page,
      totalPages: totalPages,
      // Pass stats to EJS
      totalOrders,
      totalUsers,
      totalRevenue
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).send("Admin Dashboard Error: " + err.message);
  }
};

// ================= UPDATE ORDER STATUS (Preserved) =================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    
    if (!updatedOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    res.json({ success: true, status: updatedOrder.status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ADD PRODUCT (Preserved) =================
exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;
    let imagePath = req.file ? "/images/" + req.file.filename : "";

    await Product.create({
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      description: description.trim(),
      image: imagePath,
      stock: Number(stock) || 0,
      isAvailable: true
    });

    res.redirect("/admin");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// ================= TOGGLE AVAILABILITY (Preserved) =================
exports.toggleProductAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.isAvailable = !product.isAvailable;
    await product.save();
    
    res.json({ success: true, isAvailable: product.isAvailable });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ================= EDIT PRODUCT (Preserved) =================
exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, stock } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { 
        name: name.trim(), 
        price: Number(price), 
        description: description.trim(),
        stock: Number(stock) 
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    console.error("Edit Product Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};