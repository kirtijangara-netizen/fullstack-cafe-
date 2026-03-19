const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");
const upload = require("../middleware/upload");

router.use(adminMiddleware);

router.get("/", adminController.getDashboard);

router.post("/update-order", adminController.updateOrderStatus);

// ADD PRODUCT WITH IMAGE
router.post("/add-product", upload.single("image"), adminController.addProduct);

router.post("/toggle-product/:id", adminController.toggleProductAvailability);

module.exports = router;