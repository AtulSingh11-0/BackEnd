const Product = require("../models/product.model");
const ApiResponse = require("../utils/responses");

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res
      .status(201)
      .json(ApiResponse.success("Product created successfully", { product }));
  } catch (err) {
    next(err);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      manufacturer,
      minPrice,
      maxPrice,
      requiresPrescription,
      expiryBefore,
      expiryAfter,
      showExpired = false,
      sortBy,
    } = req.query;

    const query = {};

    // Build filter conditions without search
    if (category) {
      // Handle multiple categories
      const categories = category.split(",").filter(Boolean);
      if (categories.length > 0) {
        query.category = { $in: categories };
      }
    }
    if (manufacturer) query.manufacturer = manufacturer;
    if (requiresPrescription)
      query.requiresPrescription = requiresPrescription === "true";

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Expiry filters
    if (!showExpired) {
      query.expiryDate = { $gt: new Date() };
    }
    if (expiryBefore || expiryAfter) {
      query.expiryDate = query.expiryDate || {};
      if (expiryBefore) query.expiryDate.$lte = new Date(expiryBefore);
      if (expiryAfter) query.expiryDate.$gte = new Date(expiryAfter);
    }

    // Sorting
    const sortOptions = {};
    if (sortBy) {
      switch (sortBy) {
        case "price_asc":
          sortOptions.price = 1;
          break;
        case "price_desc":
          sortOptions.price = -1;
          break;
        case "name_asc":
          sortOptions.name = 1;
          break;
        case "name_desc":
          sortOptions.name = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json(
      ApiResponse.success("Products retrieved successfully", {
        products,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      })
    );
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json(ApiResponse.error("Product not found"));
    }

    res
      .status(200)
      .json(ApiResponse.success("Product retrieved successfully", { product }));
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json(ApiResponse.error("Product not found"));
    }

    res
      .status(200)
      .json(ApiResponse.success("Product updated successfully", { product }));
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json(ApiResponse.error("Product not found"));
    }

    res.status(200).json(ApiResponse.success("Product deleted successfully"));
  } catch (err) {
    next(err);
  }
};

// method to get nearly expired products
exports.getNearlyExpiredProducts = async (req, res, next) => {
  try {
    const daysThreshold = parseInt(req.query.days) || 90; // Default 90 days
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const products = await Product.find({
      expiryDate: {
        $gt: new Date(),
        $lte: thresholdDate,
      },
    }).sort({ expiryDate: 1 });

    res.status(200).json(
      ApiResponse.success("Nearly expired products retrieved successfully", {
        products,
        threshold: {
          days: daysThreshold,
          date: thresholdDate,
        },
      })
    );
  } catch (err) {
    next(err);
  }
};

// Method to remove expired products
exports.removeExpiredProducts = async (req, res, next) => {
  try {
    const result = await Product.deleteMany({
      expiryDate: { $lt: new Date() },
    });

    res.status(200).json(
      ApiResponse.success("Expired products removed successfully", {
        removedCount: result.deletedCount,
      })
    );
  } catch (err) {
    next(err);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;

    // Validate query parameter
    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json(ApiResponse.error("Search query must be provided"));
    }

    const searchPattern = new RegExp(query.trim(), "i");

    // Search across multiple fields using $or
    const products = await Product.find({
      $or: [
        { name: searchPattern },
        { description: searchPattern },
        { manufacturer: searchPattern },
        { activeIngredients: searchPattern },
        { category: searchPattern },
      ],
    });

    if (products.length > 0) {
      products.sort((a, b) => {
        const nameMatchA = a.name.match(searchPattern) ? 2 : 0;
        const nameMatchB = b.name.match(searchPattern) ? 2 : 0;

        const descMatchA = a.description.match(searchPattern) ? 1 : 0;
        const descMatchB = b.description.match(searchPattern) ? 1 : 0;

        return nameMatchB + descMatchB - (nameMatchA + descMatchA);
      });
    }

    res.status(200).json(
      ApiResponse.success("Products retrieved successfully", {
        products,
        total: products.length,
        query: query.trim(),
      })
    );
  } catch (err) {
    next(err);
  }
};
