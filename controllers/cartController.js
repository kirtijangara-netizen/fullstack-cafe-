// controllers/cartController.js

// ================= GET CART PAGE =================
exports.getCartPage = (req, res) => {
  try {
    res.render("cart", {
      title: "Your Cart",
      user: req.user || null
    });
  } catch (error) {
    console.error("Cart Page Error:", error);
    res.status(500).send("Server Error");
  }
};


// ================= CHECKOUT =================
exports.checkout = (req, res) => {
  try {
    const { items, pickupTime } = req.body;

    // 🔐 Login check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required"
      });
    }

    // 🛑 Cart validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // 🛑 Pickup validation
    if (!pickupTime) {
      return res.status(400).json({
        success: false,
        message: "Pickup time required"
      });
    }

    // 🔥 Ensure correct structure (VERY IMPORTANT)
    const formattedItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    // 🚨 Prevent undefined productId issue
    const invalidItem = formattedItems.find(i => !i.productId);
    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart data. Please clear cart and try again."
      });
    }

    // 💰 Safe total calculation
    const totalPrice = formattedItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    console.log(`Order preview by ${req.user.name}`);
    console.table(formattedItems);

    return res.status(200).json({
      success: true,
      total: totalPrice
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};