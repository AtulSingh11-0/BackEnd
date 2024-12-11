const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/error.middleware");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(errorHandler);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Online Medicine Shop API" });
});

// Routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const prescriptionRoutes = require("./routes/prescription.routes");
const paymentRoutes = require("./routes/payment.routes");
const trackingRoutes = require("./routes/tracking.routes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/prescriptions", prescriptionRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/tracking", trackingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
