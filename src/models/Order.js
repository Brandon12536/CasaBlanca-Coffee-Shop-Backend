// src/models/Order.js
const mongoose = require("mongoose");
const {
  PROCESSING,
  PREPARING,
  READY,
  SHIPPED,
  DELIVERED,
  COMPLETED,
  CANCELLED,
  PAYMENT_METHODS,
} = require("../constants/orderStatuses");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        PROCESSING,
        PREPARING,
        READY,
        SHIPPED,
        DELIVERED,
        COMPLETED,
        CANCELLED,
      ],
      default: PROCESSING,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    tableNumber: {
      type: Number,
    },
    isDelivery: {
      type: Boolean,
      default: false,
    },
    deliveryAddress: {
      street: String,
      city: String,
      zipCode: String,
      details: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
