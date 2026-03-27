const Product = require("../models/product");

exports.getProducts = async (req, res) => {
  try {
    const category = req.query.category || "all";
    const search = req.query.search || "";
    let page = parseInt(req.query.page) || 1;
    const limit = 8; 

    let filter = { isAvailable: true };

    if (category !== "all") {
      filter.category = category.toLowerCase();
    }

    if (search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit) || 1;

    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 }) 
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