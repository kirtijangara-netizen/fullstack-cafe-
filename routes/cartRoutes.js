const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// ================= CART PAGE =================
// URL: /cart
router.get("/", cartController.getCartPage);

// ================= CHECKOUT (Optional Preview API) =================
// URL: /cart/checkout
router.post("/checkout", cartController.checkout);

module.exports = router;