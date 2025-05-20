// src/routes/addressRoutes.js
const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", addressController.getAddresses);
router.post("/", addressController.addAddress);
router.put("/:addrId", addressController.updateAddress);
router.delete("/:addrId", addressController.deleteAddress);

module.exports = router;
