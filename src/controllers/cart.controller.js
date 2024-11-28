const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const ApiResponse = require("../utils/responses");

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res
      .status(200)
      .json(ApiResponse.success("Cart retrieved successfully", { cart }));
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      throw new ValidationError("Product ID is required");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ValidationError("Quantity must be a positive whole number");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.stockQuantity < quantity) {
      throw new ValidationError(
        `Only ${product.stockQuantity} units available in stock`
      );
    }

    // Check if product is expired
    if (product.expiryDate && product.expiryDate < new Date()) {
      throw new ValidationError("Cannot add expired product to cart");
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + product.price * item.quantity;
    }, 0);

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json(ApiResponse.success("Item added to cart", { cart }));
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json(ApiResponse.error("Product not found"));
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json(ApiResponse.error("Insufficient stock"));
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json(ApiResponse.error("Cart not found"));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json(ApiResponse.error("Item not found in cart"));
    }

    cart.items[itemIndex].quantity = quantity;
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + product.price * item.quantity;
    }, 0);

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json(ApiResponse.success("Cart item updated", { cart }));
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart) {
      return res.status(404).json(ApiResponse.error("Cart not found"));
    }

    cart.items = cart.items.filter(
      (item) => item.product._id.toString() !== productId
    );

    cart.totalAmount = cart.items.reduce((total, item) => {
      const price = item.product.price;
      const quantity = item.quantity;
      console.log(
        `Product ID: ${item.product._id}, Price: ${price}, Quantity: ${quantity}`
      );

      if (typeof price !== "number" || typeof quantity !== "number") {
        throw new Error("Invalid product price or quantity");
      }
      return total + price * quantity;
    }, 0);

    await cart.save();

    res
      .status(200)
      .json(ApiResponse.success("Item removed from cart", { cart }));
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json(ApiResponse.error("Cart not found"));
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res
      .status(200)
      .json(ApiResponse.success("Cart cleared successfully", { cart }));
  } catch (err) {
    next(err);
  }
};
