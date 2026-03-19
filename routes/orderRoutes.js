const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// GET Order Page
router.get("/", orderController.getOrderPage);

// POST Place Order
router.post("/", orderController.placeOrder);

module.exports = router;