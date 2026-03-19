const Product = require("../models/product");

// ================= GET PRODUCTS =================
exports.getProducts = async (req, res) => {
  try {

    const category = req.query.category || "all";
    const search = req.query.search || "";
    let page = parseInt(req.query.page) || 1;

    const limit = 8; // show 8 products per page
    let filter = { isAvailable: true };

    // Category filter
    if (category !== "all") {
      filter.category = category.toLowerCase();
    }

    // Search filter
    if (search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // Total products
    const totalProducts = await Product.countDocuments(filter);

    const totalPages = Math.ceil(totalProducts / limit) || 1;

    // Prevent page overflow
    if (page > totalPages) {
      page = totalPages;
    }

    const skip = (page - 1) * limit;

    // Fetch products
    const products = await Product.find(filter)
      .sort({ category: 1 })
      .skip(skip)
      .limit(limit);

    res.render("products", {
      products,
      user: req.user || null,
      selectedCategory: category,
      search,
      currentPage: page,
      totalPages
    });

  } catch (error) {
    console.error("Product Page Error:", error);
    res.status(500).send("Server Error");
  }
};