const { ValidationError } = require("../utils/errors");

class ShippingService {
  validateAddress(address) {
    const { street, city, state, zipCode } = address;

    if (!street || street.length < 5) {
      throw new ValidationError("Invalid street address");
    }

    if (!city || !/^[a-zA-Z\s]{2,50}$/.test(city)) {
      throw new ValidationError("Invalid city name");
    }

    if (!state || !/^[a-zA-Z\s]{2,50}$/.test(state)) {
      throw new ValidationError("Invalid state name");
    }

    if (!zipCode || !/^\d{6}$/.test(zipCode)) {
      throw new ValidationError("Invalid ZIP code - must be 6 digits");
    }
  }

  calculateShippingFee(items, address) {
    // Base shipping fee
    let fee = 50;

    // Add weight-based fee
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    fee += totalItems * 10; // ₹10 per item

    // Zone-based fee
    const zone = this.getDeliveryZone(address.state);
    fee += this.getZoneFee(zone);

    return Math.round(fee);
  }

  getDeliveryZone(state) {
    const zones = {
      Delhi: "north",
      Maharashtra: "west",
      Karnataka: "south",
      "West Bengal": "east",
    };
    return zones[state] || "other";
  }

  getZoneFee(zone) {
    const zoneFees = {
      north: 0,
      south: 30,
      east: 40,
      west: 20,
      other: 50,
    };
    return zoneFees[zone] || zoneFees.other;
  }
}

// Create singleton instance
const shippingService = new ShippingService();

// Export the instance instead of the class
module.exports = shippingService;
