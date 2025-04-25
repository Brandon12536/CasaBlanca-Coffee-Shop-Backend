const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/stripe/create-payment-intent:
 *   post:
 *     summary: Crea un PaymentIntent de Stripe
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentIntentRequest'
 *     responses:
 *       200:
 *         description: Devuelve el client_secret de Stripe
 *       400:
 *         description: Faltan datos requeridos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/create-payment-intent', stripeController.createPaymentIntent);

/**
 * @swagger
 * /api/stripe/webhook:
 *   post:
 *     summary: Webhook de Stripe para registrar orden y pago tras pago exitoso
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Evento de Stripe
 *     responses:
 *       200:
 *         description: Webhook recibido correctamente
 *       400:
 *         description: Error de validación de firma
 *       500:
 *         description: Error interno del servidor
 */
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.stripeWebhook);

/**
 * @swagger
 * /api/stripe/checkout:
 *   post:
 *     summary: Registrar orden y pago directo desde el frontend (protegido)
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *     responses:
 *       200:
 *         description: Orden y pago registrados correctamente
 *       400:
 *         description: Error de validación o inserción
 *       500:
 *         description: Error interno del servidor
 */
router.post('/checkout', protect, stripeController.checkout);

module.exports = router;
