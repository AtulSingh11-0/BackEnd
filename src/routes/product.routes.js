const express = require("express");
const productController = require("../controllers/product.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Protected routes - Only admin/pharmacy can manage products
router.use(protect);
router.use(restrictTo("admin", "pharmacy"));

router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

// Special routes for product expiry management
router.get(
  "/expiry/nearly-expired",
  productController.getNearlyExpiredProducts
);
router.delete(
  "/expiry/remove-expired",
  productController.removeExpiredProducts
);

module.exports = router;
