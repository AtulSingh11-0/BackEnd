const express = require("express");
const paymentController = require("../controllers/payment.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const {
  validatePaymentOperation,
} = require("../middleware/payment.middleware");

const router = express.Router();

router.use(protect);

// Customer routes
router.post(
  "/process",
  validatePaymentOperation,
  paymentController.processPayment
);
router.get("/order/:orderId", paymentController.getPaymentsByOrder);

// Admin/Pharmacy routes
router.use(restrictTo("admin", "pharmacy"));
router.post("/cod/:paymentId/confirm", paymentController.confirmCODPayment);
router.post("/:paymentId/refund", paymentController.processRefund);

module.exports = router;
