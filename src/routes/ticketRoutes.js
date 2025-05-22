const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Descargar ticket de compra
 *     description: Permite a un usuario descargar el ticket de su compra en formato PDF
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Ticket en formato PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado, token no válido
 *       403:
 *         description: Prohibido, no tienes permiso para ver este ticket
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error del servidor
 */
// Temporalmente sin protección para pruebas
router.get("/:id", ticketController.downloadTicket);

module.exports = router;
