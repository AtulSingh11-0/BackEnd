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
      search,
      expiryBefore,
      expiryAfter,
      showExpired = false,
    } = req.query;

    const query = {};

    // Build filter conditions
    if (category) query.category = category;
    if (manufacturer) query.manufacturer = manufacturer;
    if (requiresPrescription)
      query.requiresPrescription = requiresPrescription === "true";
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Expiry date filters
    if (!showExpired) {
      query.expiryDate = { $gt: new Date() };
    }

    if (expiryBefore || expiryAfter) {
      query.expiryDate = query.expiryDate || {};
      if (expiryBefore) query.expiryDate.$lte = new Date(expiryBefore);
      if (expiryAfter) query.expiryDate.$gte = new Date(expiryAfter);
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
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
