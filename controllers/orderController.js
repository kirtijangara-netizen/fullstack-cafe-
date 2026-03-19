const Order = require("../models/order");

// ================= GET ORDER PAGE =================
exports.getOrderPage = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login");
    }

    // Get logged-in user's previous orders
    const userOrders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.render("order", {
      user: req.user,
      orders: userOrders
    });

  } catch (error) {
    console.error("Order Page Error:", error);
    res.status(500).send("Server Error");
  }
};


// ================= PLACE ORDER =================
exports.placeOrder = async (req, res) => {
  try {

    // 🔐 Login check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required"
      });
    }

    const { items, pickupTime } = req.body;

    // 🛑 Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    if (!pickupTime) {
      return res.status(400).json({
        success: false,
        message: "Pickup time required"
      });
    }

    // 🔥 Ensure correct structure
    const formattedItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    // 🚨 Prevent MongoDB validation error
    const invalidItem = formattedItems.find(i => !i.productId);
    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart data. Please clear cart and try again."
      });
    }

    // 💰 Calculate total
    const totalAmount = formattedItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    // 🧾 Create Order
    const newOrder = new Order({
      user: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      items: formattedItems,
      totalAmount,
      pickupTime,
      status: "Pending"
    });

    await newOrder.save();

    return res.status(200).json({
      success: true,
      message: "Order placed successfully!"
    });

  } catch (error) {
    console.error("Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};