const Order = require("../models/order.model");
const ApiResponse = require("../utils/responses");

exports.getTracking = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json(ApiResponse.error("Order not found"));
    }

    res.status(200).json(
      ApiResponse.success("Tracking info retrieved successfully", {
        tracking: order.tracking,
      })
    );
  } catch (err) {
    next(err);
  }
};

exports.updateTracking = async (req, res, next) => {
  try {
    const { status, location, description } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json(ApiResponse.error("Order not found"));
    }

    // Update tracking info
    order.tracking.currentStatus = status;
    order.tracking.currentLocation = location;

    // Add tracking update
    order.tracking.updates.push({
      status,
      location,
      description,
      timestamp: new Date(),
    });

    // Set estimated delivery for shipped orders
    if (status === "shipped" && !order.tracking.estimatedDelivery) {
      order.tracking.estimatedDelivery = new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      );
    }

    // Update order status to match tracking status
    order.orderStatus = status;

    await order.save();

    res.status(200).json(
      ApiResponse.success("Tracking updated successfully", {
        tracking: order.tracking,
      })
    );
  } catch (err) {
    next(err);
  }
};
