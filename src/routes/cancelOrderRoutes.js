const express = require('express');
const router = express.Router();
const cancelOrderController = require('../controllers/cancelOrderController');

/**
 * @swagger
 * /api/orders/cancel:
 *   post:
 *     summary: Cancelar un pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *               payment_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               cancellation_reason:
 *                 type: string
 *             required:
 *               - order_id
 *               - payment_id
 *               - user_id
 *     responses:
 *       200:
 *         description: Pedido cancelado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pedido cancelado correctamente
 */
router.post('/cancel', cancelOrderController.cancelOrder);

module.exports = router;
