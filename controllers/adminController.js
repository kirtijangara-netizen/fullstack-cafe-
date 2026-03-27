const Order = require("../models/order");
const Product = require("../models/product");
const Support = require("../models/Support");

// ================= ADMIN DASHBOARD (Supports No-Refresh Pagination) =================
exports.getDashboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8; 
    const skip = (page - 1) * limit;

    // Fetch paginated products
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    // AJAX CHECK: If clicking pagination, return JSON only
    if (req.query.ajax === 'true' || req.xhr) {
      return res.json({
        success: true,
        products,
        currentPage: page,
        totalPages
      });
    }

    // Full Page Load Data (Orders & Support)
    const orders = await Order.find()
      .populate("user", "name email") 
      .populate({
        path: "items.productId",
        select: "name price" 
      })
      .sort({ createdAt: -1 });

    const supportRequests = await Support.find().sort({ createdAt: -1 });

    res.render("adminDashboard", {
      orders: orders || [],
      products: products || [],
      supportRequests: supportRequests || [],
      user: req.user || null,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).send("Admin Dashboard Error: " + err.message);
  }
};

// ================= UPDATE ORDER STATUS (No-Refresh AJAX) =================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    
    if (!updatedOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    // Returns status to update the badge color/text instantly
    res.json({ success: true, status: updatedOrder.status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ADD PRODUCT (Includes Stock) =================
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
      stock: Number(stock) || 0, // NEW: Stock logic
      isAvailable: true
    });

    // After adding, we redirect back to refresh the list
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// ================= TOGGLE AVAILABILITY (No-Refresh AJAX) =================
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

// ================= EDIT PRODUCT (Includes Stock & No-Refresh AJAX) =================
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
        stock: Number(stock) // NEW: Update stock logic
      },
      { new: true } // Returns the object AFTER the update
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Returns the full product object so the frontend script can 
    // update the UI card without a page refresh
    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    console.error("Edit Product Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};