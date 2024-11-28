const express = require("express");
const cartController = require("../controllers/cart.controller");
const { protect } = require("../middleware/auth.middleware");
const { validateCartOperation } = require("../middleware/cart.middleware");

const router = express.Router();

router.use(protect);

router.get("/", cartController.getCart);
router.post("/add", validateCartOperation, cartController.addToCart);
router.put("/update", validateCartOperation, cartController.updateCartItem);
router.delete("/remove/:productId", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);

module.exports = router;
