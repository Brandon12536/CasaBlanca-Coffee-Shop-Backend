// src/models/Address.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    address_line1: { type: String, required: true, trim: true },
    address_line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postal_code: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "Mexico" },
    phone: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = addressSchema;
