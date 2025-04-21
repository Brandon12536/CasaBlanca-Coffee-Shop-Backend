const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');


/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - items
 *         - total
 *         - shipping_address
 *         - payment_method
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único de la orden
 *         items:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de IDs de productos
 *         total:
 *           type: number
 *           description: Total de la orden
 *         shipping_address:
 *           type: string
 *           description: Dirección de envío
 *         payment_method:
 *           type: string
 *           description: Método de pago
 *         status:
 *           type: string
 *           description: Estado de la orden (ej. pendiente, pagado, enviado)
 *           example: pendiente
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *       example:
 *         id: "b1a6e2b0-0e4c-4f7a-9b8e-2e5b6a5d6e3f"
 *         items: ["e9b1b7e4-8d33-4b3c-9b1f-4f3e2f6e3a1f", "b2c2b7e4-8d33-4b3c-9b1f-4f3e2f6e3a1f"]
 *         total: 150
 *         shipping_address: "Av. Ejemplo 123, CDMX"
 *         payment_method: "tarjeta"
 *         status: "pendiente"
 *         created_at: "2025-04-17T15:17:19Z"
 */
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crea una nueva orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Orden creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Error en los datos
 *       401:
 *         description: No autorizado
 */
router.post('/', protect, orderController.createOrder);
/**
 * @swagger
 * /api/orders/user:
 *   get:
 *     summary: Obtiene las órdenes del usuario autenticado
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 */
router.get('/user', protect, orderController.getUserOrders);
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtiene una orden por ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 */
router.get('/:id', protect, orderController.getOrderById);

// Rutas solo para administradores
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Obtiene todas las órdenes (solo admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las órdenes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 */
router.get('/', protect, authorize('admin'), orderController.getAllOrders);
/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Actualiza el estado de una orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: enviado
 *     responses:
 *       200:
 *         description: Estado de la orden actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 */
router.put('/:id/status', protect, authorize('admin'), orderController.updateOrderStatus);

module.exports = router;
