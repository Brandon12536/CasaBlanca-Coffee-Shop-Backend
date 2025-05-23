// src/routes/invoiceRoutes.js
const express = require("express");
const { generateInvoice, sendInvoiceByEmail } = require("../controllers/invoiceController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.get("/:orderId", protect, generateInvoice);
router.post("/:orderId/email", protect, sendInvoiceByEmail);

module.exports = router;
