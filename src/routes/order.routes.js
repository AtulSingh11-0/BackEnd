const express = require("express");
const orderController = require("../controllers/order.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const {
  validateOrderCreation,
  validateOrderOperation,
} = require("../middleware/order.middleware");

const router = express.Router();

// Protect all order routes
router.use(protect);

// Customer routes
router.post("/create", validateOrderCreation, orderController.createOrder);
router.get("/", orderController.getUserOrders);
router.get(
  "/prescription-required",
  orderController.getPrescriptionRequiredOrders
);
router.get("/:id", orderController.getOrderById);
router.put("/:id/cancel", orderController.cancelOrder);

// Admin/Pharmacy routes
router.put(
  "/:id/status",
  restrictTo("admin", "pharmacy"),
  validateOrderOperation,
  orderController.updateOrderStatus
);

module.exports = router;
