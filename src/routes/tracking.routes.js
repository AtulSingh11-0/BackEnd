const express = require("express");
const trackingController = require("../controllers/tracking.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

const router = express.Router();

// Protect all routes
router.use(protect);

// Customer routes
router.get("/:orderId", trackingController.getTracking);

// Admin/Pharmacy routes
router.put(
  "/:orderId",
  restrictTo("admin", "pharmacy"),
  trackingController.updateTracking
);

module.exports = router;
