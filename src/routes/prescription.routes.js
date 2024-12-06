const express = require("express");
const prescriptionController = require("../controllers/prescription.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const {
  upload,
  handleMulterError,
} = require("../middleware/fileValidation.middleware");
const {
  validatePrescriptionVerification,
} = require("../middleware/prescription.middleware");

const router = express.Router();

router.use(protect);

router.post(
  "/upload/:orderId",
  upload.single("prescriptionImage"),
  handleMulterError,
  prescriptionController.uploadPrescription
);
router.get("/my-prescriptions", prescriptionController.getUserPrescriptions);

// Pharmacy/Admin routes
router.use(restrictTo("pharmacy", "admin"));
router.get("/pending", prescriptionController.getPendingPrescriptions);
router.get("/order/:orderId", prescriptionController.getPrescriptionByOrderId);
router.put(
  "/:id/verify",
  validatePrescriptionVerification,
  prescriptionController.verifyPrescription
);

module.exports = router;
