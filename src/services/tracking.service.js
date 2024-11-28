const Order = require("../models/order.model");

class TrackingService {
  generateTrackingNumber() {
    return `TRK${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }

  async updateOrderStatus(orderId, status, details = {}) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.orderStatus = status;
    
    if (status === "shipped") {
      order.trackingNumber = this.generateTrackingNumber();
      order.deliveryEstimate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    }

    if (details.location) {
      order.currentLocation = details.location;
    }

    await order.save();
    return order;
  }

  async getOrderTimeline(orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    return {
      orderId: order._id,
      currentStatus: order.orderStatus,
      trackingNumber: order.trackingNumber,
      deliveryEstimate: order.deliveryEstimate,
      timeline: [
        { status: "pending", date: order.createdAt },
        ...(order.orderStatus !== "pending" ? [{ status: order.orderStatus, date: order.updatedAt }] : [])
      ]
    };
  }
}

module.exports = new TrackingService();