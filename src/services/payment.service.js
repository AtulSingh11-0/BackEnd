const Payment = require("../models/payment.model");
const Order = require("../models/order.model");
const { ValidationError } = require("../utils/errors");

class PaymentService {
  async validateCardDetails(cardDetails) {
    if (!cardDetails) {
      throw new ValidationError("Card details are required");
    }

    const { cardNumber, expiryMonth, expiryYear, cvv } = cardDetails;

    if (!/^\d{16}$/.test(cardNumber)) {
      throw new ValidationError("Invalid card number - must be 16 digits");
    }

    if (!/^\d{2}$/.test(expiryMonth) || expiryMonth > 12) {
      throw new ValidationError("Invalid expiry month");
    }

    const currentYear = new Date().getFullYear() % 100;
    if (!/^\d{2}$/.test(expiryYear) || expiryYear < currentYear) {
      throw new ValidationError("Invalid expiry year");
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      throw new ValidationError("Invalid CVV");
    }
  }

  async processPayment(orderId, userId, method, paymentDetails = {}) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Simulate payment processing with different payment methods
    let transactionId;
    let status;

    switch (method) {
      case "card":
        await this.validateCardDetails(paymentDetails);
        // Simulate card payment processing
        transactionId = `CARD_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        status = Math.random() > 0.1 ? "completed" : "failed"; // 90% success rate
        break;

      case "wallet":
        // Simulate digital wallet payment
        transactionId = `WALLET_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        status = Math.random() > 0.05 ? "completed" : "failed"; // 95% success rate
        break;

      case "cod":
        // Cash on delivery is always initially pending
        transactionId = `COD_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        status = "pending";
        break;

      default:
        throw new Error("Invalid payment method");
    }

    const payment = await Payment.create({
      order: orderId,
      user: userId,
      amount: order.totalAmount,
      method,
      status,
      transactionId,
      paymentDetails:
        method === "card"
          ? {
              cardLast4: paymentDetails.cardNumber.slice(-4),
            }
          : {},
    });

    // Update order payment status
    order.paymentStatus = status;
    await order.save();

    return payment;
  }

  async confirmCODPayment(paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.method !== "cod") {
      throw new Error("Invalid payment");
    }

    payment.status = "completed";
    await payment.save();

    const order = await Order.findById(payment.order);
    order.paymentStatus = "completed";
    await order.save();

    return payment;
  }

  async processRefund(paymentId, reason) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "completed") {
      throw new Error("Can only refund completed payments");
    }

    payment.status = "refunded";
    payment.refundDetails = {
      reason,
      refundedAt: new Date(),
      amount: payment.amount,
    };
    await payment.save();

    const order = await Order.findById(payment.order);
    order.paymentStatus = "refunded";
    await order.save();

    return payment;
  }
}

module.exports = new PaymentService();
