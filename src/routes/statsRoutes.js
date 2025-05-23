// src/routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validatePeriod, validateLimit } = require("../utils/validators");

// Middleware para verificar admin
const isAdmin = [protect, authorize("admin")];

/**
 * @swagger
 * components:
 *   schemas:
 *     StatsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           description: Datos de la respuesta
 *         message:
 *           type: string
 *           description: Mensaje descriptivo
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Mensaje de error
 *         error:
 *           type: string
 *           description: Detalles del error (solo en desarrollo)
 *   parameters:
 *     periodParam:
 *       in: query
 *       name: period
 *       schema:
 *         type: string
 *         enum: [day, week, month, year]
 *         default: month
 *       description: Período de tiempo para agrupar estadísticas
 *     limitParam:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 5
 *       description: Límite de resultados a devolver
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Estadísticas
 *   description: Endpoints para gestión de estadísticas
 */

/**
 * @swagger
 * /api/stats/sales-summary:
 *   get:
 *     summary: Obtener resumen general de ventas
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de ventas obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *               example:
 *                 success: true
 *                 data:
 *                   totalSales: 15000
 *                   monthlySales: 5000
 *                   totalOrders: 45
 *                 message: "Resumen de ventas obtenido correctamente"
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado - Token inválido o no proporcionado
 *       403:
 *         description: Prohibido - Requiere rol de administrador
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/sales-summary", isAdmin, statsController.getSalesSummary);

/**
 * @swagger
 * /api/stats/sales-by-period:
 *   get:
 *     summary: Obtener ventas agrupadas por período
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/periodParam'
 *     responses:
 *       200:
 *         description: Ventas por período obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *               example:
 *                 success: true
 *                 data:
 *                   - period_start: "2023-01-01"
 *                     period_end: "2023-01-07"
 *                     total_sales: 3500
 *                     order_count: 12
 *                 message: "Ventas por período obtenidas correctamente"
 *       400:
 *         description: Período inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Período no válido. Usar: day, week, month o year"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       500:
 *         description: Error del servidor
 */
router.get("/sales-by-period", isAdmin, statsController.getSalesByPeriod);

/**
 * @swagger
 * /api/stats/top-products:
 *   get:
 *     summary: Obtener productos más vendidos
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Productos más vendidos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *               example:
 *                 success: true
 *                 data:
 *                   - product_id: "prod_123"
 *                     total_quantity: 25
 *                     product:
 *                       name: "Café Especial"
 *                       image: "cafe-especial.jpg"
 *                 message: "Top 5 productos obtenidos correctamente"
 *       400:
 *         description: Límite inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "El límite debe ser un número entre 1 y 100"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       500:
 *         description: Error del servidor
 */
router.get("/top-products", isAdmin, statsController.getTopProducts);

/**
 * @swagger
 * /api/stats/customer-stats:
 *   get:
 *     summary: Obtener estadísticas de clientes
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de clientes obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *               example:
 *                 success: true
 *                 data:
 *                   totalCustomers: 120
 *                   newCustomers: 15
 *                 message: "Estadísticas de clientes obtenidas correctamente"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       500:
 *         description: Error del servidor
 */
router.get("/customer-stats", isAdmin, statsController.getCustomerStats);

/**
 * @swagger
 * /api/stats/reservation-stats:
 *   get:
 *     summary: Obtener estadísticas de reservaciones
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de reservaciones obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *               example:
 *                 success: true
 *                 data:
 *                   totalReservations: 85
 *                   monthlyReservations: 20
 *                 message: "Estadísticas de reservaciones obtenidas correctamente"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       500:
 *         description: Error del servidor
 */
router.get("/reservation-stats", isAdmin, statsController.getReservationStats);

module.exports = router;
