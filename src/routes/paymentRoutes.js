const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Crear un pago y registrar la orden y los items
/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Registra el pago y crea la orden y sus items
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               total:
 *                 type: number
 *               shipping_address:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               status:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               stripe_payment_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               receipt_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pago, orden y items registrados exitosamente
 */
router.post("/", paymentController.createPaymentAndOrder);

module.exports = router;
