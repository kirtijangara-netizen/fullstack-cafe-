const Order = require("../models/order");
const Product = require("../models/product"); // ✅ Essential for stock management

// ================= GET ORDER PAGE =================
// (Shows past orders and user context)
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


// ================= PLACE ORDER (With Stock Reduction) =================
exports.placeOrder = async (req, res) => {
  try {
    // 1. 🔐 Security & Login check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required"
      });
    }

    const { items, pickupTime } = req.body;

    // 2. 🛑 Initial Validation
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

    // 3. 🔍 Validate Stock for ALL items before making any changes
    // This prevents a situation where 1 item is in stock but another isn't
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product "${item.name}" was not found in our database.` 
        });
      }

      if (product.stock < Number(item.quantity)) {
        return res.status(400).json({ 
          success: false, 
          message: `Sorry, ${product.name} is out of stock. Available: ${product.stock}` 
        });
      }
    }

    // 4. 🔥 Deduct Stock from Database
    // We only reach this point if ALL items have enough stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -Number(item.quantity) } // Subtracts the quantity
      });
    }

    // 5. 💰 Calculate total and Format Items for Order Record
    const formattedItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    const totalAmount = formattedItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    // 6. 🧾 Create and Save the Order
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

    // 7. 🎉 Final Success Response
    return res.status(200).json({
      success: true,
      message: "Order placed successfully! Your stock has been reserved."
    });

  } catch (error) {
    console.error("Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while processing your order."
    });
  }
};